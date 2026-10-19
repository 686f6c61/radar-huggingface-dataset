# timm/vit_huge_patch16_radio_v4.c_radio

## Resumen

`vit_huge_patch16_radio_v4.c_radio` es un encoder visual ViT-H/16 de NVIDIA, publicado en timm, que forma parte de la familia C-RADIOv4 (Agglomerative Vision Foundation Model). No es un modelo de lenguaje: su función es convertir imágenes en representaciones vectoriales densas y globales para tareas de visión por computador. El checkpoint contiene 631.985.920 parámetros (632,0 M), trabaja de forma nativa a 512x512 y produce 1.034 tokens por imagen: 10 tokens de prefijo y 1.024 tokens de parche de 1.280 dimensiones.

C-RADIOv4 se entrena mediante destilación multi-profesor de SigLIP2-g, DINOv3-7B y SAM3, y este repositorio es un remapeo nativo a timm de los pesos originales de `nvidia/C-RADIOv4-H`, sin entrenamiento adicional. Es relevante porque concentra en un único encoder características semánticas y espaciales útiles para clasificación, segmentación e indexado visual, con resultados destacados en ImageNet kNN y ADE20k. La licencia es la NVIDIA Open Model License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-H/16 con 10 tokens de prefijo (CLS por profesor y registros); encoder de imagen |
| Parametros totales | 631.985.920 (632,0 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica a texto; imagen nativa de 512x512 con 1.034 tokens por imagen (10 de prefijo + 1.024 de parche) |
| Tipos de cuantizacion | No disponible; el repositorio contiene safetensors y no se listan variantes GGUF, INT8 o FP16 empaquetadas |
| Idiomas soportados | No disponible (no aplica: encoder visual, no procesa texto) |
| Licencia | NVIDIA Open Model License |
| Formato
