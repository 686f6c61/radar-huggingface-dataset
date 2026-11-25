# WaveCut/Ternary-Bonsai-2.5-27B-PTQ1_0-NInfer-v3

## Resumen

Ternary Bonsai 2.5 27B PTQ1_0 NInfer v3 es un artefacto de inferencia del modelo Ternary Bonsai 2.5 27B de PrismML, empaquetado en el formato propietario `.ninfer` v3 por el usuario WaveCut para el motor NInfer. El modelo subyacente es un transformer de 27.000 millones de parámetros con pesos ternarios (valores en {-1, 0, +1}) cuantizados en el formato PTQ1_0 de PrismML, que ocupa 1,75 bits por peso. Esto reduce el fichero completo a 6,17 GiB, un tamaño que permite ejecutar un modelo de 27B en GPU de consumo como la RTX 3090.

La relevancia de este artefacto radica en la combinación de tres elementos: cuantización ternaria extrema, una ventana de contexto de 262.144 tokens y decodificación especulativa mediante una cabeza MTP (multi-token prediction) incluida en el propio fichero. El autor reporta velocidades de decodificación de entre 94 y 189 tok/s sin drafter y de hasta 324 tok/s con MTP en una RTX 5090, con un contexto completo de 262K tokens.

El modelo base emplea una arquitectura híbrida con capas de atención y componentes GDN (gated delta network), e incluye una torre de visión heredada de Qwen3.8-27B, lo que habilita la modalidad image-text-to-text. La licencia es Apache 2.0. Es importante señalar que este artefacto solo funciona con la rama `master` de iamwavecut/ninfer-all; las compilaciones estándar de NInfer rechazan el fichero porque el formato `gguf_ptq1_0` y el uso auxiliar `hadamard_signs` solo existen en esa línea de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención y GDN (gated delta network); 64 capas; cabeza MTP de una capa |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | PTQ1_0 ternario (1,75 bits por peso) para proyecciones de texto, cabeza de salida y tabla de tokens; BF16/FP32 para controles GDN, normas, convolución, `A_log` y `dt_bias`; Q4_0 para la cabeza MTP; Q4/Q5/Q6/Q8 para la torre de visión |
| Idiomas soportados | no disponible (la model card menciona una prueba de decodificación en ruso, pero no se declara una lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` v3 (fichero único de 6.625.487.872 bytes, 6,17 GiB); modelo base en GGUF |

## Arquitectura y entrenamiento

El modelo base Ternary Bonsai 2.5 27B de PrismML es un transformer de 64 capas que combina mecanismos de atención con capas GDN (gated delta network), una variante de atención lineal con estado recurrente. Los pesos del modelo se almacenan en formato ternario PTQ1_0: cada bloque de 128 valores ternarios ocupa 28 bytes, con cinco dígitos en base 3 por byte y una escala en binary16. Las proyecciones se almacenan rotadas mediante transformada de Hadamard, y el motor restaura cada fila de tokens con el vector de signos correspondiente al ancho oculto. Los controles GDN (`A_log`, `dt_bias`), las normas y las convoluciones se conservan en BF16 o FP32 para preservar la precisión numérica.

El artefacto incluye una cabeza MTP (multi-token prediction) de una capa con matrices en Q4_0, afinada por PrismML a partir de la cabeza de Bonsai 2, que actúa como drafter para decodificación especulativa. También incorpora una cabeza de propuesta construida a partir de las filas de la cabeza de salida para los 131.072 tokens más frecuentes del ranking de NInfer, con la rotación de la cabeza copiada byte a byte. La torre de visión es la de Qwen3.8-27B en formatos Q4/Q5/Q6/Q8. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con ventana de contexto de 262.144 tokens.
- Generación de código: la model card menciona una prueba de decodificación que genera un módulo Python.
- Razonamiento matemático: se menciona un problema verbal (word problem) entre las pruebas de decodificación.
- Procesamiento de imágenes y vídeo: modalidad image-text-to-text mediante la torre de visión de Qwen3.8-27B; se activa con el flag `--vision`.
- Decodificación especulativa mediante cabeza MTP integrada, con 3 borradores por ronda y tasas de aceptación de aproximadamente 0,47-0,50.
- Soporte de plantilla de chat Qwen3.8 (`qwen3_8.jinja`), lo que implica compatibilidad con el formato de conversación de la familia Qwen3.8.
- Modo thinking desactivable (las pruebas se realizaron con thinking off).
- Servidor compatible con las APIs de OpenAI y Anthropic en `http://localhost:8080/v1`.
- Capacidades multilingües: se menciona una prueba en ruso, pero no se declara una lista formal de idiomas.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno con documentos extensos gracias a su ventana de 262.144 tokens, procesando contratos, informes o bases de código completas sin truncamiento. La velocidad de decodificación de 84,7 tok/s tras 32K tokens en una RTX 3090 lo hace viable en hardware de consumo.
- Generación de código en local: con 27B de parámetros y un fichero de 6,17 GiB, se puede desplegar en una estación de trabajo con RTX 4090 o 5090 para autocompletado y generación de módulos Python, manteniendo los datos en local. La inclusión de la plantilla Qwen3.8 facilita la integración con herramientas que ya soportan esa familia.
- Análisis de documentos con imágenes: la torre de visión permite procesar capturas, diagramas o páginas escaneadas junto con texto, útil para extracción de información de facturas, informes técnicos o documentación mixta.
- Despliegue en hardware de consumo para prototipado: el tamaño de 6,17 GiB permite ejecutar un modelo de 27B en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) usando el motor NInfer con KV en `rk8v4`, algo inviable con pesos en BF16.
- Servicio de inferencia de alta velocidad con MTP: la decodificación especulativa con la cabeza MTP alcanza 324 tok/s en RTX 5090 y 202,8 tok/s en RTX 4090, adecuado para aplicaciones interactivas que requieren baja latencia por token.
- Procesamiento por lotes con múltiples peticiones: el motor soporta ocho peticiones simultáneas de 16.384 tokens cada una, útil para tareas de clasificación, resumen o extracción sobre grandes volúmenes de documentos.
- Investigación en cuantización extrema: el artefacto sirve como referencia para estudiar el impacto del formato ternario PTQ1_0 y la rotación de Hadamard en la calidad de un modelo de 27B, con informes de conversión y sumas SHA256 incluidos.

## Benchmarks y rendimiento

La model card reporta velocidades de decodificación medidas en noviembre de 2026, con una petición a la vez, decodificación greedy, thinking desactivado, KV en `rk8v4`, ventana de 262.144 tokens y cada tarjeta a su límite de potencia por defecto. La "charla corta" es la media de velocidad de decodificación sobre cinco respuestas de 512 tokens.

| Metrica | RTX 3090 | RTX 4090 | RTX 5090 | RTX PRO 6000 |
|---|---:|---:|---:|---:|
| Charla corta, sin drafter (tok/s) | 94,1 | 125,6 | 188,9 | 187,9 |
| Charla corta, MTP, 3 borradores (tok/s) | 149,8 (0,49; 2,46) | 202,8 (0,49; 2,46) | 324,0 (0,50; 2,49) | 320,4 (0,47; 2,42) |
| Decodificación tras 32K tokens, sin drafter (tok/s) | 84,7 | 111,7 | 167,8 | 159,4 |

Los valores entre paréntesis indican la tasa de aceptación de MTP y los tokens por ronda de verificación. La model card se interrumpe en la fila de decodificación tras 131K tokens, por lo que no se dispone de ese dato completo. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 6,17 GiB; con KV en `rk8v4` y estado GDN en FP16, el consumo adicional depende de la ventana configurada. Para 262.144 tokens de contexto se requiere memoria significativa adicional, no cuantificada en la información disponible.
- GPU con perfil integrado: RTX 3090 (420 W), RTX 4090 (450 W), RTX 5090 (575 W) y RTX PRO 6000 Blackwell Workstation Edition (600 W). Cualquier otra GPU se calibra una vez en el primer arranque y guarda el resultado en el volumen `ninfer-cache`.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 (24 GB de VRAM), así como en RTX 5090.
- Opciones de despliegue: motor NInfer (rama `master` de iamwavecut/ninfer-all), disponible como imagen Docker `ghcr.io/iamwavecut/ninfer-all` o compilado desde fuente. Requiere driver NVIDIA de la rama CUDA 13 (580 o superior) y NVIDIA Container Toolkit. Las compilaciones estándar de NInfer rechazan este fichero.
- Latencia y throughput: según la tabla de resultados, entre 94,1 y 324,0 tok/s en charla corta según tarjeta y uso de MTP; tras 32K tokens, entre 84,7 y 167,8 tok/s sin drafter.
- Flags relevantes: `--max-context 262144`, `--kv-capacity 262144`, `--kv-dtype rk8v4`, `--gdn-state-fp16`, `--spec mtp`, `--draft-tokens 3`. Para ventanas mayores, `--kv-dtype rk4v4 --rope-yarn`. `--vision` activa imágenes y vídeo; `--vision-residency overlay` mantiene la torre en memoria de host fijada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B PTQ1_0 (este artefacto) | 27B | 262.144 | Ternaria PTQ1_0 (1,75 bits/peso) | Apache 2.0 | `.ninfer` v3 / NInfer master |
| Ternary Bonsai 2.5 27B PQ2_0 (mismo autor) | 27B | 262.144 | PQ2_0 ternaria | Apache 2.0 | `.ninfer` v3 / NInfer master |
| Ternary Bonsai 2.5 27B GGUF (PrismML, base) | 27B | 262.144 | PTQ1_0 en GGUF | Apache 2.0 | GGUF / llama.cpp y derivados |

El artefacto PQ2_0 del mismo autor contiene los mismos valores ternarios en otra representación: según la model card, PTQ1_0 decodifica una petición más rápido sin drafter en todas las tarjetas medidas y deja más espacio para ventanas largas, mientras que PQ2_0 es más rápido con MTP, con varias peticiones simultáneas y en el procesamiento de prompts. No se dispone de datos de benchmarks de calidad que permitan comparar la degradación frente al modelo base en BF16.

## Limitaciones y advertencias

- Compatibilidad restringida: el fichero solo funciona con la rama `master` de iamwavecut/ninfer-all; las compilaciones estándar de NInfer lo rechazan porque el formato `gguf_ptq1_0` y el uso `hadamard_signs` no existen fuera de esa línea.
- Cuantización ternaria agresiva: con 1,75 bits por peso, es esperable cierta pérdida de calidad frente al modelo en BF16, aunque no se han publicado benchmarks de calidad en la información disponible que la cuantifiquen.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de fidelidad factual para este artefacto.
- Idiomas: no se declara una lista oficial de idiomas soportados; la única referencia es una prueba de decodificación en ruso.
- Sesgos: no se dispone de información sobre sesgos conocidos del modelo base ni de este artefacto.
- Contexto: aunque la ventana es de 262.144 tokens, el rendimiento de decodificación decae con la profundidad (de 188,9 a 167,8 tok/s en RTX 5090 entre charla corta y 32K tokens sin drafter), y la model card no completa los datos a 131K tokens.
- Requisitos de sistema: driver NVIDIA de la rama CUDA 13 (580 o superior) y NVIDIA Container Toolkit para la imagen Docker.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; el modelo base es de PrismML y este artefacto es una conversión de terceros, por lo que la responsabilidad de validación en producción recae en el usuario.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el motor requiere una rama de desarrollo concreta, lo que implica un riesgo de estabilidad para producción.

## Enlaces

- Artefacto en Hugging Face: https://huggingface.co/WaveCut/Ternary-Bonsai-2.5-27B-PTQ1_0-NInfer-v3
- Modelo base en GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Variante PQ2_0 del mismo autor: https://huggingface.co/WaveCut/Ternary-Bonsai-2.5-27B-PQ2_0-NInfer-v3
- Motor NInfer (repositorio original): https://github.com/Neroued/ninfer
- Rama NInfer-all (requerida): https://github.com/iamwavecut/ninfer-all
- Commit de referencia de las mediciones: https://github.com/iamwavecut/ninfer-all/commit/312a964da666fbc9b4ea9c5fbdcb488116c4fe3e
- Lista de GPU con perfil integrado: https://github.com/iamwavecut/ninfer-all/blob/master/docs/gpus.md
- Instrucciones de compilación: https://github.com/iamwavecut/ninfer-all#building
- Imagen Docker: https://github.com/iamwavecut/ninfer-all#docker
