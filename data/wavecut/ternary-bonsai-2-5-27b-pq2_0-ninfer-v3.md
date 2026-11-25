# WaveCut/Ternary-Bonsai-2.5-27B-PQ2_0-NInfer-v3

## Resumen

Ternary Bonsai 2.5 27B PQ2_0 NInfer v3 es un artefacto de inferencia cuantizado del modelo Ternary Bonsai 2.5 27B de PrismML, empaquetado por WaveCut para el motor NInfer. El modelo base es un transformer ternario de 27.000 millones de parametros derivado de Qwen3.8-27B, con capacidades multimodales (image-text-to-text) y una ventana de contexto de 262.144 tokens. Este artefacto concreto emplea el formato PQ2_0 (2,125 bits por peso) y esta pensado para ejecutarse en GPUs de consumo y estaciones de trabajo como RTX 3090, RTX 4090, RTX 5090 y RTX PRO 6000.

La relevancia de este artefacto reside en que comprime un modelo de 27B en un unico fichero de 7,37 GiB, lo que permite desplegarlo en una sola GPU de 24 GB con contexto completo. Incluye decodificacion especulativa mediante una cabeza MTP (multi-token prediction) afinada por PrismML, una torre de vision heredada de Qwen3.8-27B y un head de propuesta derivado del output head para acelerar el drafting. El motor NInfer-all anade perfiles de dispositivo por GPU y soporte para las APIs de OpenAI y Anthropic.

Este artefacto no es un modelo nuevo: es una conversion del GGUF ternario de PrismML a un formato propietario de NInfer. Solo funciona con la rama `master` de `iamwavecut/ninfer-all`; las builds estandar de NInfer rechazan el fichero porque los tipos `t2_g128_fp16` y el uso auxiliar `hadamard_signs` solo existen en esa linea. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion completa, capas GDN (gated delta network) y torre de vision; modelo base derivado de Qwen3.8-27B |
| Parametros totales | 27.000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | PQ2_0 (2,125 bits por peso) para proyecciones de texto; BF16/FP32 para controles GDN, normas, convolucion, `A_log` y `dt_bias`; Q4_0 para la cabeza MTP; Q4/Q5/Q6/Q8 para la torre de vision |
| Idiomas soportados | no disponible (la model card no especifica; el modelo base Qwen3.8-27B es multilingue, pero no se confirma en la informacion proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (formato propietario de NInfer); el modelo base esta en GGUF |

## Arquitectura y entrenamiento

El modelo base Ternary Bonsai 2.5 27B es un transformer de 27B derivado de Qwen3.8-27B, con 64 capas de proyecciones de texto en formato ternario. La arquitectura combina atencion estandar con capas GDN (gated delta network), un mecanismo de estado recurrente que reduce el coste de memoria en contextos largos. Los pesos ternarios se almacenan con escalas binary16 por cada grupo de 128 pesos (`t2_g128_fp16`) y se rotan mediante una transformada de Hadamard, con un vector de signos por cada anchura de entrada que el motor usa para restaurar cada fila de token.

El artefacto NInfer v3 incluye una cabeza MTP (multi-token prediction) afinada por PrismML a partir de la cabeza de Bonsai 2, con matrices en bloques Q4_0 copiadas byte a byte. Tambien incorpora un head de propuesta que reutiliza las filas del output head para los 131.072 tokens mas frecuentes del ranking de NInfer, lo que permite drafting especulativo sin una cabeza separada. La torre de vision es la `mmproj` de Qwen3.8-27B en formatos Q4/Q5/Q6/Q8. La plantilla de chat es la `qwen3_8.jinja` fijada por NInfer. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un transformer de 27B con contexto de 262.144 tokens, adecuado para tareas de razonamiento de contexto largo.
- Generacion de codigo: la model card menciona un modulo Python entre las respuestas de prueba, lo que sugiere capacidad de generacion de codigo, aunque no se detalla su rendimiento.
- Capacidades multimodales: la torre de vision permite entrada de imagenes y video mediante el flag `--vision`, con opcion de residencia en memoria host fijada (`--vision-residency overlay`).
- Decodificacion especulativa: soporte de MTP con `--spec mtp --draft-tokens 3`, con tasas de aceptacion de aproximadamente 0,49-0,51 y 2,46-2,52 tokens por ronda de verificacion.
- Soporte de tool calling / function calling: no se menciona explicitamente en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no se menciona explicitamente en la informacion proporcionada.
- Capacidades multilingues: la model card menciona una explicacion en ruso entre las respuestas de prueba, lo que sugiere soporte de al menos ingles y ruso, pero no se detalla la lista completa de idiomas.
- Modo thinking: las pruebas se realizaron con "thinking off", lo que implica que el modelo base soporta un modo de razonamiento que puede activarse, aunque no se detalla en la informacion proporcionada.
- Servidor compatible con APIs de OpenAI y Anthropic en `http://localhost:8080/v1`.

## Casos de uso

- Despliegue en GPU de consumo: el fichero de 7,37 GiB cabe en una RTX 3090 o RTX 4090 de 24 GB, permitiendo ejecutar un modelo de 27B con contexto completo de 262.144 tokens en hardware asequible. El motor NInfer incluye perfiles de dispositivo para estas GPUs.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir libros completos, bases de codigo o expedientes legales en una sola pasada, manteniendo coherencia gracias a las capas GDN que reducen el coste de memoria.
- Analisis de imagenes y video: la torre de vision integrada permite tareas de image-text-to-text, como descripcion de imagenes, extraccion de informacion de capturas o analisis de fotogramas de video, con la opcion de mantener la torre en memoria host para liberar VRAM.
- Servicio de inferencia compatible con OpenAI: el servidor NInfer expone endpoints compatibles con OpenAI y Anthropic, lo que permite sustituir APIs comerciales en aplicaciones existentes sin cambiar el codigo del cliente.
- Generacion de codigo en pipelines: aunque no se detalla el soporte de tool calling, el modelo puede generar modulos Python (se menciona uno entre las pruebas) y ejecutarse en un contenedor Docker con acceso a GPU, integrándose en flujos de CI/CD.
- Atencion al cliente multi-turno: la ventana de 262.144 tokens permite mantener historiales de conversacion muy largos y recuperar contexto de interacciones previas, con latencias de 92,8-348,6 tok/s segun la GPU y el uso de MTP.
- Procesamiento por lotes con concurrencia: la model card reporta ocho peticiones simultaneas en ocho carriles de 16.384 tokens, lo que permite servir multiples usuarios en una sola GPU.
- Traduccion y generacion multilingue: la mencion de una explicacion en ruso sugiere uso para tareas de traduccion o generacion en idiomas distintos del ingles, aunque la lista completa de idiomas no esta disponible.

## Benchmarks y rendimiento

La model card proporciona tasas de decodificacion medidas en noviembre de 2026, con una peticion a la vez, greedy, thinking off, KV `rk8v4` y ventana de 262.144 tokens. No se publican resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | RTX 3090 | RTX 4090 | RTX 5090 | RTX PRO 6000 |
|---|---:|---:|---:|---:|
| Chat corto, sin drafter (tok/s) | 92,8 | 109,2 | 166,1 | 167,2 |
| Chat corto, MTP, 3 drafts (tok/s) | 189,4 (0,50; 2,50) | 232,1 (0,51; 2,52) | 344,9 (0,49; 2,46) | 348,6 (0,49; 2,48) |
| Decodificacion tras 32K tokens, sin drafter (tok/s) | 83,7 | 98,6 | 150,0 | 143,9 |
| Decodificacion tras 131K tokens, sin drafter (tok/s) | 66,5 | 77,9 | 116,2 | 116,0 (parcial) |

Entre parentesis se indica la tasa de aceptacion de MTP y los tokens por ronda de verificacion. Las pruebas de chat corto son la media de cinco respuestas de 512 tokens (ensayo, modulo Python, problema de palabras, explicacion en ruso, lista). Las pruebas en profundidad usan una respuesta de ~400 palabras tras un documento de esa longitud. Cada tarjeta se ejecuto a su limite de potencia por defecto (RTX 3090 420 W, RTX 4090 450 W, RTX 5090 575 W, RTX PRO 6000 600 W).

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero `.ninfer` ocupa 7,37 GiB; con KV cache `rk8v4` a 262.144 tokens y estado GDN en FP16, el consumo total debe caber en 24 GB para las RTX 3090/4090, aunque la model card no desglosa el uso exacto de VRAM.
- GPUs recomendadas: RTX 3090, RTX 4090, RTX 5090 y RTX PRO 6000 Blackwell Workstation Edition, todas con perfiles de dispositivo integrados en NInfer.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 (24 GB), asi como en RTX 5090 (32 GB). Cualquier otra GPU se calibra una vez en el primer arranque y guarda el resultado en el volumen `ninfer-cache`.
- Opciones de despliegue: imagen Docker `ghcr.io/iamwavecut/ninfer-all` o build de la rama `master` de `iamwavecut/ninfer-all`. Requiere driver NVIDIA de la rama CUDA 13 (580 o superior) y NVIDIA Container Toolkit. Soporta APIs de OpenAI y Anthropic.
- Latencia y throughput: 92,8-348,6 tok/s en chat corto segun GPU y uso de MTP; 66,5-150,0 tok/s en decodificacion tras 131K tokens sin drafter. Ocho peticiones concurrentes en carriles de 16.384 tokens.
- Flags relevantes: `--spec mtp --draft-tokens 3` para decodificacion especulativa; `--vision` para imagenes y video; `--vision-residency overlay` para mantener la torre en memoria host; `--kv-dtype rk4v4 --rope-yarn` con mayor `--max-context` y `--kv-capacity` para ventanas extendidas; `--full-draft-head` para usar el head completo en lugar del head de propuesta reducido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B PQ2_0 (NInfer v3) | 27B | 262.144 | PQ2_0 (2,125 bits/peso) | Apache 2.0 | Hugging Face, motor NInfer-all |
| Ternary Bonsai 2.5 27B PTQ1_0 (NInfer v3) | 27B | 262.144 (mayor margen para ventanas extendidas) | PTQ1_0 | Apache 2.0 | Hugging Face, motor NInfer-all |
| Ternary Bonsai 2.5 27B (GGUF original de PrismML) | 27B | no disponible en la informacion proporcionada | Ternario (GGUF) | Apache 2.0 | Hugging Face, llama.cpp y otros motores GGUF |
| Qwen3.8-27B | 27B | no disponible en la informacion proporcionada | Multiples (Q4/Q5/Q6/Q8 en la torre de vision) | no disponible en la informacion proporcionada | Hugging Face |

El artefacto PQ2_0 es mas rapido con MTP, con varias peticiones simultaneas y en el procesamiento de prompts, mientras que PTQ1_0 decodifica una sola peticion mas rapido sin drafter en todas las tarjetas medidas y deja mas margen para ventanas de contexto extendidas. El GGUF original de PrismML es la fuente de la conversion y requiere motores compatibles con GGUF, mientras que este artefacto solo funciona con NInfer-all. No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con Qwen3.8-27B u otros modelos de tamano similar.

## Limitaciones y advertencias

- Compatibilidad restringida: el fichero solo funciona con la rama `master` de `iamwavecut/ninfer-all`; las builds estandar de NInfer lo rechazan porque los tipos `t2_g128_fp16` y el uso auxiliar `hadamard_signs` no existen en esa linea.
- Formato propietario: el formato `.ninfer` no es portable a otros motores de inferencia como llama.cpp, vLLM, TGI u Ollama; queda ligado al ecosistema NInfer.
- Requisitos de driver: necesita driver NVIDIA de la rama CUDA 13 (580 o superior) y NVIDIA Container Toolkit para el despliegue en Docker.
- Riesgo de alucinacion: no se dispone de evaluaciones especificas de alucinacion en la informacion proporcionada; como todo modelo generativo, puede producir contenido factualmente incorrecto.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; el modelo base Qwen3.8-27B puede heredar sesgos de sus datos de entrenamiento, no detallados.
- Limitaciones de idioma: la lista completa de idiomas soportados no esta disponible; solo se confirma el uso en ingles y ruso en las pruebas de la model card.
- Cuantizacion agresiva: PQ2_0 usa 2,125 bits por peso, lo que puede degradar la calidad respecto al modelo en BF16 o FP16; no se proporcionan metricas de perdida de calidad.
- Sin adaptador DFlash2: Bonsai 2.5 no dispone de adaptador DFlash2, segun la model card.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y la torre de vision heredan las condiciones de Qwen3.8-27B, cuya licencia no se detalla en la informacion proporcionada; conviene verificar las condiciones del modelo base antes de un despliegue comercial.
- Contexto extendido: alcanzar ventanas superiores a 262.144 tokens requiere `--kv-dtype rk4v4 --rope-yarn` y mayor `--kv-capacity`, lo que puede afectar a la calidad y al consumo de memoria.
- Sin benchmarks academicos: no se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible, lo que dificulta la evaluacion cualitativa frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Ternary-Bonsai-2.5-27B-PQ2_0-NInfer-v3
- Variante PTQ1_0 del mismo autor: https://huggingface.co/WaveCut/Ternary-Bonsai-2.5-27B-PTQ1_0-NInfer-v3
- Modelo base GGUF de PrismML: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Repositorio NInfer-all (rama master): https://github.com/iamwavecut/ninfer-all
- Commit de referencia de las mediciones: https://github.com/iamwavecut/ninfer-all/commit/312a964da666fbc9b4ea9c5fbdcb488116c4fe3e
- Documentacion de GPUs soportadas: https://github.com/iamwavecut/ninfer-all/blob/master/docs/gpus.md
- Instrucciones de compilacion: https://github.com/iamwavecut/ninfer-all#building
- Instrucciones de Docker: https://github.com/iamwavecut/ninfer-all#docker
