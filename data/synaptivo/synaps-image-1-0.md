# Synaptivo/Synaps-Image-1.0

## Resumen

Synaps-Image 1.0 es un toolkit de inferencia text-to-image desarrollado por Synaptivo que se construye sobre el generador abierto FLUX 3 Image Klein de Black Forest Labs y su ampliador de prompts PUP. No es un modelo generativo nuevo ni incluye pesos propios: el repositorio contiene exclusivamente codigo y configuracion (Apache-2.0) que orquesta un pipeline de tres etapas para mejorar la precision del texto renderizado dentro de las imagenes. El problema que aborda es concreto: los generadores de imagen actuales fallan al reproducir cadenas literales entre comillas (carteles, posters, etiquetas), duplicando palabras, omitiendo caracteres o introduciendo texto no solicitado.

La innovacion reside en el bucle de reparacion de texto PUP-T. Cuando el prompt contiene texto entre comillas, un verificador local basado en Qwen3.8-27B lee el texto visible de la imagen renderizada; si la lectura no coincide con lo solicitado, se reescribe el caption y se generan hasta 2 x 2 candidatos adicionales, seleccionando el de mayor precision a nivel de caracter. Los prompts sin texto entrecomillado pasan por el pipeline estandar Klein + PUP sin modificacion.

El modelo es relevante en el contexto actual de generacion de imagenes con tipografia fiable, un caso de uso critico para publicidad, diseno grafico y materiales impresos. La evaluacion pre-registrada sobre 193 prompts en ingles reporta una mejora de +8,65 pp en 1-CER y +1,73 pp en exact match respecto al baseline, con un coste medio de 1,80 renders por prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de inferencia sobre FLUX 3 Image Klein (difusion) + PUP (upsampler de prompts) + verificador Qwen3.8-27B |
| Parametros totales | No disponible (el repositorio no incluye pesos; PUP reportado como 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el pipeline de referencia usa bf16) |
| Idiomas soportados | No disponible (evaluacion limitada a ingles; otros idiomas no medidos) |
| Licencia | Apache-2.0 (codigo y configuracion de Synaptivo); pesos de FLUX 3 Image Klein bajo FLUX Kommunity License; PUP bajo Apache-2.0 |
| Formato de pesos | No aplica (el repositorio no distribuye pesos; tamano del repo 0.0 GB) |

## Arquitectura y entrenamiento

El sistema no entrena un modelo generativo. Se compone de tres etapas encadenadas: (1) PUP 9B, un upsampler de prompts de Black Forest Labs bajo Apache-2.0 que reescribe la peticion del usuario en un caption detallado preservando literalmente el texto entrecomillado; (2) FLUX 3 Image Klein, el generador de difusion que renderiza a 1024 px en 16 pasos; y (3) PUP-T, el componente propio de Synaptivo, que activa un bucle de reparacion solo cuando el prompt contiene texto entre comillas.

El bucle PUP-T emplea un verificador OCR basado en Qwen3.8-27B (copia local en bf16) que lee el texto visible de la imagen. Si la lectura no coincide con el texto solicitado, se reescribe el caption y se renderizan hasta 2 x 2 candidatos adicionales, seleccionando el de mayor precision de caracter. Las etapas 1 y 2 corresponden al pipeline del proveedor; la aportacion de Synaptivo es el enrutado condicional y el bucle de reparacion. Los pins de componentes se documentan en `pipeline.json`. No se especifican datos de entrenamiento, tokens ni tecnicas de RLHF/DPO porque no hay entrenamiento implicito en el toolkit.

## Capacidades

- Generacion de imagenes text-to-image a 1024 px en 16 pasos mediante FLUX 3 Image Klein.
- Renderizado de texto literal entre comillas con correccion iterativa basada en verificacion OCR.
- Deteccion automatica de discrepancias entre el texto solicitado y el texto visible en la imagen generada.
- Seleccion del mejor candidato entre multiples renders mediante precision a nivel de caracter.
- Enrutado condicional: los prompts sin texto entrecomillado evitan el coste del bucle de reparacion.
- Ampliacion de prompts mediante PUP 9B con preservacion verbatim de cadenas entrecomilladas.
- Trazabilidad de la decision del bucle mediante fichero `trace.json`.
- Configuracion de componentes por identificador de Hub o directorio local (`--klein`, `--pup`, `--verifier`).
- API Python (`generate`, `models`, `caption_for`) y CLI (`python -m synaps_image`).
- No soporta tool calling, agentes, vision de entrada ni audio: es exclusivamente text-to-image.

## Casos de uso

- **Carteles y posters con texto obligatorio**: el bucle PUP-T elimina duplicaciones de palabras y omisiones en carteles con multiples cadenas requeridas, como demuestra el ejemplo del poster con seis palabras donde el render stock repetia "FANTASTIC" y "SUPERB".
- **Etiquetado de producto y packaging**: para envases que deben mostrar nombres de producto, ingredientes o claims literales, el verificador OCR asegura que el texto impreso coincide con el solicitado antes de dar la imagen por valida.
- **Material publicitario con eslogans**: el ejemplo del grill muestra como el render stock imprimia el eslogan dos veces, la segunda incompleta; tras una ronda de reparacion aparece una sola vez.
- **Portadas de folletos y brochures**: el bucle elimina texto no solicitado (como pies de pagina no pedidos) y conserva los textos requeridos, aunque el texto pequeno de etiquetas de producto puede seguir corrupto por limitacion del generador.
- **Prototipado rapido de creatividades**: integrable en pipelines de diseno generativo donde se necesita validacion automatica de tipografia antes de revision humana, con trazabilidad via `trace.json`.
- **Generacion de senaletica y rotulacion**: para carteles de tienda, pizarras de cafeteria o rotulos con texto entrecomillado, donde la precision de caracter es critica y el coste de 1,80 renders por prompt es asumible.
- **Control de calidad de generadores**: utilizable como capa de post-proceso sobre FLUX 3 Image Klein en produccion para reducir la tasa de rechazo por texto mal renderizado.

## Benchmarks y rendimiento

Evaluacion pre-registrada sobre 193 prompts frescos en ingles con texto entrecomillado (43 de OneIG-Bench text rendering, 150 de TIIF-Bench test), fuera de los conjuntos usados para construir o ajustar PUP-T. Baseline: Klein + PUP stock con el mismo caption y semilla. Jueces: Qwen3-VL-32B para OCR y UniGenBench-32B para seguimiento global del prompt.

| Metrica | Klein + PUP | Synaps-Image 1.0 | Diferencia, IC 95% |
|---|---|---|---|
| text 1-CER | 85,05% | 93,70% | +8,65 pp, +5,63..+11,93 |
| text exact match | 94,54% | 96,27% | +1,73 pp, +0,35..+3,43 |
| UniGenBench-32B | 93,78% | 95,47% | +1,68 pp, +0,26..+3,37 |

Coste en prompts con texto:
- 130 de 193 prompts terminan tras el primer render (1 render, 1 lectura del verificador).
- 49 prompts requieren una ronda de reparacion (3 renders); 14 requieren dos (5 renders); media de 1,80 renders por prompt.
- Una lectura del verificador tarda 4,4 s de media en una RTX PRO 6000. La latencia end-to-end no se midio (la confirmacion se ejecuto por etapas en lotes).
- La imagen final difiere del render stock en 46 de 193 prompts.

## Requisitos de hardware

- Memoria GPU pico medida: 70 GB en una RTX PRO 6000 con Klein y el verificador cargados simultaneamente.
- PUP se carga primero (18 GB en bf16) y se libera antes de cargar Klein y el verificador.
- GPU recomendadas: RTX PRO 6000 (configuracion medida), H100 80 GB, A100 80 GB. No cabe en GPUs de consumo (RTX 4090 24 GB, RTX 3090 24 GB) con la configuracion de referencia en bf16.
- Opciones de despliegue: CLI (`python -m synaps_image`) y API Python (`generate`, `models`, `caption_for`). Dependencias: torch, diffusers, transformers, accelerate, huggingface_hub, pillow.
- Latencia: lectura del verificador 4,4 s de media por imagen en RTX PRO 6000; latencia end-to-end no medida.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Texto en imagen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synaps-Image 1.0 | No aplica (toolkit sobre FLUX 3 Klein + PUP 9B + Qwen3.8-27B) | No disponible | 1-CER 93,70%, exact match 96,27% | Apache-2.0 (codigo) | Hugging Face (0 descargas, 0 likes) |
| FLUX 3 Image Klein + PUP (stock) | PUP 9B + generador | No disponible | 1-CER 85,05%, exact match 94,54% | FLUX Kommunity License | Black Forest Labs |
| Generadores text-to-image sin bucle OCR | No disponible | No disponible | No disponible | Variable | Variable |

La comparativa se limita al baseline directo del propio toolkit porque no se han publicado comparaciones con otros sistemas de reparacion de texto en imagen en la informacion disponible.

## Limitaciones y advertencias

- La mejora solo esta medida en prompts en ingles con texto entrecomillado; prompts sin comillas no se modifican por construccion.
- Idiomas distintos del ingles (incluido el polaco) no han sido evaluados.
- No hay evaluacion en benchmarks de seguridad.
- El texto pequeno de etiquetas de producto puede seguir corrupto: es una limitacion del generador que PUP-T no corrige.
- La reproducibilidad no es bit-exacta: los renders de Klein con mismo caption y semilla dan PSNR 27-51 dB frente a la medicion original (diffusers vs Flow-Factory); los captions de PUP coinciden solo en 1 de 6 casos por divergencia de decodificacion greedy entre generacion por lotes y una a una.
- El repositorio no incluye pesos; los usuarios deben obtener FLUX 3 Image Klein bajo FLUX Kommunity License, con posibles restricciones de uso comercial ajenas a la licencia Apache-2.0 del codigo.
- No esta afiliado ni respaldado por Black Forest Labs.
- El verificador por defecto es `Qwen/Qwen3.8-27B`; se debe comprobar que coincide con la copia local usada en la medicion (bf16).
- Las comprobaciones de paridad se ejecutan contra codigo de investigacion y ficheros de medicion que no forman parte del repositorio.
- Riesgo de alucinacion del verificador OCR no cuantificado en la informacion disponible.
- Sesgos del generador subyacente no documentados en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Synaptivo/Synaps-Image-1.0
- Modelo base FLUX 3 Image Klein: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Modelo base PUP: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Verificador por defecto: https://huggingface.co/Qwen/Qwen3.8-27B
- OneIG-Bench (benchmark citado): no disponible
- TIIF-Bench (benchmark citado): no disponible
- UniGenBench-32B (juez citado): no disponible
