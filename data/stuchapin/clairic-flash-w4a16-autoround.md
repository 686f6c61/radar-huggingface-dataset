# stuchapin/Clairic-Flash-W4A16-AutoRound

## Resumen

Clairic Flash W4A16 AutoRound es una cuantización de solo pesos a 4 bits del modelo Cloudflare/clairic-flash, un extractor de información estructurada de tipo "System One" desarrollado por Cloudflare sobre una base Qwen3.5-9B. El modelo original resuelve un problema muy concreto: dado un estado (texto, imágenes o PDF) y un conjunto de campos tipados declarados por el usuario, devuelve valores extraídos, puntuaciones de confianza, probabilidades de nulo y los spans de origen. Esta variante reduce el peso en disco de 19,6 GB a 11 GB y el peso en VRAM de 18,2 GiB a 11,1 GiB, manteniendo el formato de petición y respuesta original.

La cuantización la firma el usuario stuchapin (no Cloudflare) mediante AutoRound 0.16.1 con empaquetado `auto_gptq`, en esquema W4A16 (pesos int4, activaciones BF16), grupo de 128 y simetría. Se cuantizan las proyecciones MLP de las 32 capas del decodificador y las proyecciones de atención completa (q/k/v/o) de las 8 capas de atención completa; se preservan en BF16 las 24 capas de atención lineal Gated DeltaNet, los embeddings, `lm_head`, el codificador visual y las cabezas de respuesta tipadas.

Su relevancia práctica es doble: por un lado, abarata el despliegue del modelo (cabe en GPUs de consumo alto como la RTX 3090 con 14,2 GiB de pico medido); por otro, añade dos parches de runtime que permiten ejecutarlo en tarjetas Ampere, arquitectura que el runtime original de Cloudflare no soporta tal cual. El modelo cuenta con 4.817.509.616 parámetros reales según safetensors y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (32 capas decodificador: 8 de atención completa + 24 de atención lineal Gated DeltaNet), con codificador visual y cabezas de respuesta tipadas |
| Parametros totales | 4.817.509.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: int4 grupo 128 simétrico en MLP y atención completa; BF16 en atención lineal, embeddings, `lm_head`, visión y cabezas tipadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 11,7 GB; 11,1 GiB de pesos en GPU) |

## Arquitectura y entrenamiento

El modelo base es un stack tipo Qwen3.5 de 9B con una particularidad estructural: combina 8 capas de atención completa con 24 capas de atención lineal Gated DeltaNet, lo que reduce el coste de contexto largo frente a un transformer denso convencional. Sobre esa base, Cloudflare añade un codificador visual (pipeline `image-text-to-text`) y un conjunto de cabezas de respuesta tipadas empaquetadas en `clair_head.safetensors`, que son las que producen valores, confianza, probabilidad de nulo y spans de origen para cada campo declarado. El runtime propio (`clairic_model.py` y `clairic_runtime/`) gestiona el formato de petición y respuesta mediante la función `systemone`.

Esta variante no reentrena el modelo: solo cambia la precisión de un subconjunto de pesos. La calibración se hizo con AutoRound 0.16.1, 100 iteraciones, 256 muestras de 2048 tokens, solo texto y no específicas de extracción, atravesando el modelo completo. El codificador visual no se cuantiza. Los tensores `mtp.*` se conservan en BF16 en `model_extra_tensors.safetensors`, pero el runtime no los usa. Los dos parches introducidos afectan a `clairic_runtime/math.py`: el primero restringe DeepGEMM a compute capability ≥ 9.0 y usa el fallback Triton en GPUs anteriores (Ampere incluida), y el segundo añade un helper `_dtype_ref()` para que `install()` no falle al buscar `.weight` en capas lineales cuantizadas.

## Capacidades

- Extracción de información estructurada: recibe un estado (texto, imagen o PDF) y un esquema de campos tipados (`text`, `number` con decimales, `date`, `list`) y devuelve valores, confianza y spans de origen.
- Salida con probabilidad de nulo por campo, útil para distinguir "no presente en el documento" de "extraído con baja confianza".
- Procesamiento multimodal: acepta imágenes de recibos, facturas y documentos escaneados además de texto.
- Manejo de estimaciones y previsiones como tipo de campo propio, con valores que pueden variar ligeramente respecto al modelo BF16.
- Razonamiento aritmético limitado: extrae correctamente los operandos (subtotal, tipo de impuesto, plazos) pero falla en cálculos compuestos, por lo que conviene delegar la aritmética al código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Extracción de campos en facturas y recibos: se declaran campos como `vendor`, `total`, `issued` e `items` y el modelo devuelve los valores con confianza y spans; encaja en pipelines de contabilidad porque el esquema tipado evita post-procesado frágil con expresiones regulares.
- Triaje de tickets de soporte: dado el texto de un ticket, extraer categoría, producto afectado, fecha de incidencia y severidad como campos tipados, con probabilidad de nulo para detectar campos ausentes antes de escalar.
- Procesamiento de contratos de arrendamiento: extraer arrendador, renta mensual, fecha de inicio y duración; el modelo cita los spans de origen, lo que permite verificación humana sobre el documento original.
- Digitalización de albaranes y avisos de envío: al aceptar imágenes, se puede pasar la foto del documento y obtener número de seguimiento, transportista y fecha estimada de entrega como campos separados.
- Automatización de extractos bancarios: extraer importes, fechas y contrapartes de cada movimiento declarando una lista de campos, con la ventaja de que el modelo marca con baja confianza los campos que no encuentra.
- Enriquecimiento de correos de reunión: extraer asistentes, fecha, hora y orden del día de un correo, con soporte de fechas relativas ("próximo martes") resueltas contra el contexto del estado.
- Despliegue en estaciones de trabajo con RTX 3090: al requerir 11,1 GiB de pesos y un pico medido de 14,2 GiB, permite ejecutar el extractor en una GPU de consumo alto sin depender de A100/H100, algo que el runtime original no permitía en Ampere.
- Extracción con control de calidad: usar la probabilidad de nulo y la confianza por campo para enrutar automáticamente a revisión humana los documentos con campos dudosos, en lugar de aceptar o rechazar el documento completo.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estándar sino una comprobación de sanidad del autor: 13 peticiones de extracción con 49 campos puntuados, ejecutadas con `load_release_model` + `systemone` en una RTX 3090. Una petición es el ejemplo de la model card de Cloudflare; las otras 12 son sintéticas (ticket de soporte, arrendamiento, aviso de envío, cálculo de impuestos, fecha relativa, correo de reunión, extracto bancario, petición sin respuesta presente, estimación/previsión, dos imágenes de recibo y una imagen de factura).

| Métrica | BF16 (original) | W4A16 (este repo) |
|---|---|---|
| Campos correctos vs. ground truth | 46 / 49 | 47 / 49 |
| Misma respuesta que BF16 en campos que BF16 acertó | — | 46 / 46 |
| Pesos en VRAM | 18,2 GiB | 11,1 GiB |
| Pico de VRAM durante la prueba | 21,2 GiB | 14,2 GiB |
| 13 peticiones en caliente (RTX 3090) | 62,0 s | 32,6 s (1,9× más rápido) |

Diferencias observadas entre ambas precisiones: dos campos aritméticos fallan en las dos versiones con confianza muy baja (≤ 0,18), un total de tres términos (subtotal + impuesto + envío) y una fecha de vencimiento calculada como "fecha de emisión + 30 días"; en una factura sin etiqueta "From:", BF16 devolvió nulo y W4A16 devolvió el proveedor correcto; las estimaciones y previsiones se desplazaron alrededor de un 1 % (por ejemplo, 50,96 → 50,39). El autor advierte que las latencias absolutas son más lentas que las publicadas por Cloudflare por el uso de kernels de fallback en esta configuración, y que la relación BF16/W4A16 es la parte útil de la comparación.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,1 GiB de pesos en GPU; pico medido de 14,2 GiB durante las pruebas con 13 peticiones.
- GPU recomendadas: RTX 3090 verificada por el autor (Ampere, compute capability 8.6). En Hopper y posteriores (H100, H200) se usa la ruta original con DeepGEMM; en Ampere y anteriores se usa el fallback Triton del runtime.
- Cabe en GPU de consumo: sí, en RTX 3090 (24 GB) con margen; no hay datos para GPUs de 16 GB o menos.
- Opciones de despliegue: el runtime propio del modelo (`clairic_model.load_release_model` + `systemone`), con `transformers` y `auto-round==0.16.1` para los kernels int4. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 32,6 s para 13 peticiones en caliente en RTX 3090 con W4A16 (frente a 62,0 s en BF16). La primera ejecución es lenta porque los kernels `tritonv2_zp` de AutoRound compilan al primer uso (unos 11 minutos en la primera prueba del autor, 20–135 s por petición); Triton los cachea en disco y las ejecuciones posteriores son rápidas.
- Requisitos de software: Python 3.11 o superior, paquetes de `requirements.txt` más `auto-round==0.16.1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos en VRAM | Licencia | Notas |
|---|---|---|---|---|---|
| Clairic Flash W4A16 (este repo) | 4.817.509.616 | no disponible | 11,1 GiB | Apache 2.0 | Cuantización int4 del original; parches para Ampere; runtime propio |
| Cloudflare/clairic-flash (BF16) | no disponible en la información | no disponible | 18,2 GiB | Apache 2.0 (según repo derivado) | Modelo original; runtime no soporta Ampere tal cual |
| Alternativas de extracción estructurada de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría (extracción de información estructurada multimodal con salida tipada) en los datos proporcionados.

## Limitaciones y advertencias

- La primera ejecución es lenta: los kernels `tritonv2_zp` de AutoRound compilan al primer uso (unos 11 minutos en la primera prueba del autor, entre 20 y 135 s por petición); después Triton cachea en disco y la latencia baja.
- La aritmética compuesta es poco fiable: los totales con varios términos y las fechas calculadas a partir de plazos fallan en ambas precisiones con confianza muy baja; conviene extraer los operandos y calcular en código.
- Las estimaciones y previsiones pueden desviarse alrededor de un 1 % respecto a BF16 (por ejemplo, 50,96 → 50,39), lo que puede ser inaceptable en dominios financieros sensibles.
- La calibración de AutoRound se hizo solo con texto y no con datos específicos de extracción, por lo que la calidad en dominios muy alejados del corpus de calibración no está validada.
- El codificador visual no se cuantiza, de modo que el ahorro de VRAM se concentra en el decodificador; el pico de 14,2 GiB incluye visión y runtime.
- El runtime original de Cloudflare no soporta Ampere tal como se distribuye; este repo añade parches no oficiales en `clairic_runtime/math.py` que deben revisarse antes de usar en producción.
- Los tensores `mtp.*` se incluyen en BF16 pero el runtime no los usa; no aportan capacidad funcional.
- No hay información sobre sesgos, cobertura idiomática ni comportamiento multilingüe; la model card no documenta evaluación en idiomas distintos del inglés.
- Riesgo de alucinación: el modelo devuelve probabilidad de nulo y confianza por campo, pero con confianza baja puede rellenar un campo que no está presente; se recomienda umbralizar y enrutar a revisión humana.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado de Cloudflare/clairic-flash conviene verificar las condiciones del modelo base y de las dependencias (AutoRound, DeepGEMM, Triton).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-20; no hay validación independiente de la cuantización más allá de la comprobación de sanidad del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stuchapin/Clairic-Flash-W4A16-AutoRound
- Modelo base: https://huggingface.co/Cloudflare/clairic-flash
- AutoRound (herramienta de cuantización): https://github.com/intel/auto-round
