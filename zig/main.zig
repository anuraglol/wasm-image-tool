const std = @import("std");

extern fn js_convert(
    src_ptr: [*]const u8,
    src_len: usize,
    src_type_ptr: [*]const u8,
    src_type_len: usize,
    dst_type_ptr: [*]const u8,
    dst_type_len: usize,
    out_ptr: [*]u8,
    out_len: usize,
) usize;

var gpa = std.heap.GeneralPurposeAllocator(.{}){};
const allocator = gpa.allocator();

var result_buf: []u8 = &.{};
var result_len: usize = 0;

export fn wasm_alloc(len: usize) ?[*]u8 {
    const buf = allocator.alloc(u8, len) catch return null;
    return buf.ptr;
}

export fn wasm_free(ptr: [*]u8, len: usize) void {
    allocator.free(ptr[0..len]);
}

export fn get_result_len() usize {
    return result_len;
}

export fn convert(
    src_ptr: [*]const u8,
    src_len: usize,
    src_type_ptr: [*]const u8,
    src_type_len: usize,
    dst_type_ptr: [*]const u8,
    dst_type_len: usize,
) ?[*]u8 {
    if (result_buf.len > 0) {
        allocator.free(result_buf);
        result_buf = &.{};
        result_len = 0;
    }

    const out_max = src_len * 2;
    result_buf = allocator.alloc(u8, out_max) catch return null;

    const written = js_convert(
        src_ptr,
        src_len,
        src_type_ptr,
        src_type_len,
        dst_type_ptr,
        dst_type_len,
        result_buf.ptr,
        out_max,
    );

    if (written == 0) {
        allocator.free(result_buf);
        result_buf = &.{};
        return null;
    }

    result_len = written;
    return result_buf.ptr;
}
