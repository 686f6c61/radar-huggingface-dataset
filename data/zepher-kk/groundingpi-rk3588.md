# Zepher-kk/groundingpi-rk3588

## Resumen

GroundingPI-rk3588 es un archivo de ingeniería y experimentación, no un modelo listo para producción. Lo publica el usuario Zepher-kk y documenta el intento de llevar GroundingPI, un sistema de *grounding* visual (localización de objetos descritos en lenguaje natural dentro de una imagen), a la placa LubanCat 4 con SoC Rockchip RK3588. El repositorio contiene tres perfiles de despliegue: el `baseline` original (MoonViT-27 + Qwen3-4B en W8A8), un estudiante de 3 segundos (TinyViT-11M + Qwen3-1.7B en FP16) y el experimento `gpi-1s` (TinyViT-11M + Qwen3-0.6B en FP16), que es el foco del checkpoint incluido.

El resultado central es un **resultado negativo declarado explícitamente por el autor**: el perfil `gpi-1s` cumple los objetivos de latencia (P95 de 825 ms en placa, con unos 175 ms de margen sobre el segundo de presupuesto) pero falla en precisión. En la placa, con RKLLM en FP16, produce **0 salidas válidas de 64**; en W8A8 también 0/64. En PC, el modelo alcanza 64/64 sobre el conjunto de entrenamiento (mean IoU 0.994), pero solo 0/32 en el conjunto de desarrollo `dev32`, lo que evidencia sobreajuste severo y ausencia de generalización.

La relevancia del repositorio es metodológica más que funcional: documenta con detalle un fallo de paridad numérica entre PC y NPU. La base sin entrenar es idéntica bit a bit entre PC y placa (coseno de 0.999998 en logits y 0.999999 en hidden), mientras que los pesos entrenados divergen en la primera pasada (coseno 0.944 en logits, 0.534 en hidden) cuando la entrada está condicionada por imagen. El autor descarta varias causas (cabecera de salida, fila de tarea, nivel de optimización, W8A8, `embed_flash`, `base_domain_id`, troceado en 128, precisión de entrada, redondeo fp16 en activaciones, desbordamiento en MLP/atención) y señala que el SDK solo expone la última capa hidden, lo que impide un diagnóstico por capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: TinyViT-11M (vision) + Qwen3-0.6B (lenguaje), protocolo de 5 tokens, 144 tokens visuales |
| Parametros totales | no disponible (componentes: TinyViT-11M y Qwen3-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 y W8A8 en placa (RKLLM); el checkpoint publicado es un `.pt` de 3,9 MB con projector y fila de tarea |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 (codigo y documentacion del repositorio) |
| Formato de pesos | `.pt` (`artifacts/g1s-750-final.pt`, projector + fila de tarea); no se incluyen pesos de Qwen3, TinyViT ni el modelo HF fusionado de 1,5 GB |

## Arquitectura y entrenamiento

El sistema es un pipeline vision-language de dos etapas. Un backbone TinyViT-11M (pesos de `timm`, `tiny_vit_11m_224.dist_in22k_ft_in1k`) codifica la imagen en 144 tokens visuales; un proyector los alinea con el espacio de embeddings de un LLM Qwen3-0.6B en FP16, que genera una secuencia de 5 tokens que codifica la localización. El entrenamiento del perfil `gpi-1s` se hizo en PC con 64 muestras (47 imágenes), 750 pasos, con TinyViT congelado y ajuste mediante LoRA más el proyector y una fila de tarea específica. El stack declarado es Python 3.12, torch 2.9, transformers 5.7 y peft 0.21.

El resultado del entrenamiento es un sobreajuste extremo: 64/64 válidas y 64/64 con acierto sobre el propio conjunto de entrenamiento (mean IoU 0.994), pero 0/32 en `dev32`. La ablación con imágenes mal emparejadas da 19/64 y con visión a cero da 0/64, lo que sugiere que el modelo aprende una asociación espuria entre la condición visual y la respuesta en lugar de una correspondencia objeto-texto generalizable. En la placa, el mismo checkpoint produce 0/64 salidas válidas. El diagnóstico de paridad muestra que la divergencia PC-placa aparece solo tras el entrenamiento y solo con entradas condicionadas por imagen, no con la base sin ajustar.

## Capacidades

- El modelo **no es funcional como sistema de grounding**: en placa produce 0/64 salidas válidas y en PC generaliza 0/32 en `dev32`.
- El repositorio demuestra que la latencia objetivo es alcanzable: P95 de 825 ms para el perfil de 1 segundo y P95 de 2,43 s para el estudiante de 3 segundos.
- El `baseline` (MoonViT-27 + Qwen3-4B W8A8) sí es ejecutable en placa, con 6,8-7,1 s por petición, aunque su precisión de grounding no se reporta como validada en esta información.
- Soporte de tool calling, agentes, matemáticas, código o modo *thinking*: no disponible (no se documenta ninguna de estas capacidades).
- Capacidades multilingües limitadas a zh y en según los metadatos.
- El repositorio incluye utilidades de diagnóstico: sonda de paridad PC-placa sobre logits y hidden de la última capa.

## Casos de uso

- **Investigación de paridad numérica PC-NPU en RK3588**: el repositorio sirve como caso de estudio reproducible de divergencia entre un modelo ajustado en PyTorch y su conversión a RKLLM, con scripts de sonda (`student_1s_diag`) y comparación de primer paso. Es su uso más realista hoy.
- **Evaluación de presupuestos de latencia en *edge***: los informes de preflight y de placa permiten estimar qué tamaño de backbone y de LLM cabe en un segundo sobre RK3588, con medidas P50/P95 por petición.
- **Reproducción de un resultado negativo**: útil para equipos que planeen portar modelos vision-language a NPUs de Rockchip y quieran anticipar los modos de fallo documentados (divergencia solo tras entrenamiento, solo con entrada visual).
- **Base para un estudiante de grounding de 3 segundos**: el perfil `student` (TinyViT-11M + Qwen3-1.7B, 144 tokens, P95 2,43 s) es ejecutable y sus pesos están en el GitHub Release; puede servir de punto de partida para reentrenar con más datos y validación externa.
- **Docencia y auditoría de pipelines de conversión**: los directorios `docs/protocol`, `docs/parity` y `docs/fidelity-diagnosis` documentan la identidad del tokenizer, la compatibilidad con transformers 4.x y el mapeo de ids, material útil para revisar conversiones de otros modelos.
- **No recomendado para**: localización de objetos en producción, robótica, accesibilidad visual o cualquier tarea que requiera grounding fiable. El propio autor pide no citarlo como modelo de localización de 1 segundo.

## Benchmarks y rendimiento

| Metrica | gpi-1s (1 s) | student (3 s) | baseline (4B) |
|---|---|---|---|
| Latencia P95 en placa | 825 ms (preflight, prototipo sin entrenar) | 2,43 s | 6,8-7,1 s por peticion |
| Latencia P50 en placa | 806 ms (preflight) | no disponible | no disponible |
| Entrenamiento (64 muestras) | 64/64 validas, 64/64 acierto, IoU 0,994 | 45/64 | no disponible |
| Strict sobre entrenamiento | 0/64 | 0/64 | no disponible |
| Generalizacion `dev32` | 0/32 | 0/32 | no disponible |
| Placa RKLLM FP16 | 0/64 validas (1 geometrica valida, 0 acierto) | no disponible | no disponible |
| Placa RKLLM W8A8 | 0/64 validas | no disponible | no disponible |
| Ablacion imagen mal emparejada | 19/64 | no disponible | no disponible |
| Ablacion vision a cero | 0/64 | no disponible | no disponible |
| Paridad PC-placa, base sin entrenar | coseno logits 0,999998; hidden 0,999999 | no disponible | no disponible |
| Paridad PC-placa, tras entrenar | coseno logits 0,944; hidden 0,534 | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, RefCOCO) en la informacion disponible.

## Requisitos de hardware

- **Placa objetivo**: Rockchip RK3588 (LubanCat 4), con RKLLM 1.3.1 y RKNN 2.5.0 para la conversión e inferencia.
- **VRAM en GPU**: no disponible. El perfil `gpi-1s` combina un backbone de 11 M de parámetros con un LLM de 0,6 B, por lo que en FP16 el peso conjunto ronda 1,5 GB según el tamaño del modelo HF fusionado citado por el autor; esa cifra es del artefacto, no una medición de VRAM.
- **GPU recomendadas**: no disponible. El entrenamiento se ejecutó en PC con torch 2.9 y peft 0.21, pero no se especifica el hardware.
- **Ajuste en GPU de consumo**: plausible por tamaño (0,6 B en FP16), pero no confirmado en la documentación.
- **Despliegue**: RKLLM/RKNN en placa; en PC, transformers 5.7 con peft. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- **Latencia**: P50 de 806 ms y P95 de 825 ms en placa para el prototipo sin entrenar de 5 tokens; 2,43 s P95 para el estudiante de 3 s; 6,8-7,1 s por petición para el baseline de 4 B. No se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Grounding validado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GroundingPI-rk3588 `gpi-1s` | TinyViT-11M + Qwen3-0.6B | no disponible | No (0/64 en placa, 0/32 en dev32) | Apache-2.0 (repo) | Checkpoint de 3,9 MB; pesos base no incluidos |
| GroundingPI-rk3588 `student` | TinyViT-11M + Qwen3-1.7B | no disponible | No (strict 0/64, dev32 0/32) | Apache-2.0 (repo) | Pesos en GitHub Release (`student-fp16-v1`) |
| GroundingPI-4B `baseline` | MoonViT-27 + Qwen3-4B W8A8 | no disponible | No reportado | Sujeta a terminos upstream (incluye Kimi K3 License) | Pesos en GitHub Release (`baseline-4b-w8a8`) |
| Alternativas de grounding visual de referencia (p. ej. Florence-2, Qwen2.5-VL) | no disponible en esta informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con modelos de grounding de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo utilizable**: el autor lo declara explícitamente. En placa produce 0/64 salidas válidas y en PC generaliza 0/32; no debe citarse como modelo de localización de 1 segundo.
- **Sobreajuste severo**: 64/64 en entrenamiento frente a 0/32 en `dev32` indica que el ajuste memoriza el conjunto de 64 muestras y no aprende la correspondencia objeto-texto.
- **Fallo de paridad PC-placa no resuelto**: la divergencia aparece solo con pesos entrenados y entradas condicionadas por imagen; el SDK solo expone la última capa hidden, lo que bloquea el diagnóstico por capas.
- **Licencia del baseline**: los pesos convertidos de GroundingPI-4B están sujetos a términos upstream que incluyen la Kimi K3 License, distintos de la Apache-2.0 del repositorio.
- **Datos no redistribuibles**: las imágenes de COCO/RefCOCO no se incluyen por restricciones de licencia; solo se conservan estadísticas y SHA.
- **Pesos incompletos**: el repositorio no contiene Qwen3-0.6B/1.7B/4B, TinyViT, el modelo HF fusionado de 1,5 GB ni artefactos RKLLM/RKNN, por lo que la reproducción exige descargar componentes por separado.
- **Idiomas**: solo zh y en según los metadatos; sin evaluación multilingüe.
- **Riesgo de alucinación**: no evaluado en esta información; el modo de fallo documentado es ausencia de salida válida, no generación plausible incorrecta.
- **Madurez**: repositorio experimental con 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zepher-kk/groundingpi-rk3588
- Código de inferencia y experimentos: https://github.com/zepher-kk/groundingpi-rk3588
- Qwen3-0.6B (base de lenguaje): https://huggingface.co/Qwen/Qwen3-0.6B
- Releases con pesos `student-fp16-v1` y `baseline-4b-w8a8`: https://github.com/zepher-kk/groundingpi-rk3588/releases
- Pesos TinyViT de referencia (`timm`): `tiny_vit_11m_224.dist_in22k_ft_in1k`
- Documentación interna del repositorio: `docs/preflight/`, `docs/protocol/`, `docs/parity/`, `docs/pilot/`, `docs/board-eval/`, `docs/fidelity-diagnosis/`
