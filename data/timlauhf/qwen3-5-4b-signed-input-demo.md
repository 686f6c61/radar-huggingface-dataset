# timlauHF/Qwen3.5-4B-signed-input-demo

## Resumen

Qwen3.5-4B-signed-input-demo es una modificación experimental del modelo Qwen3.5-4B de Alibaba, publicada por el usuario timlauHF bajo el nombre de proyecto "secproc". No es un ajuste fino convencional orientado a mejorar capacidades, sino una demostración de investigación en la que se incrusta un pequeño computador simulado (una CPU RISC-V) delante de las capas propias de Qwen. Ese circuito ejecuta un verificador real de firmas digitales Ed25519 (la implementación Monocypher, conforme a RFC 8032), de modo que el modelo solo responde al prompt si la firma digital que lo acompaña es válida; en caso contrario emite únicamente `<verify_failed>` seguido de `<eos>`.

El interés técnico reside en que la verificación se ejecuta dentro de los propios pesos del modelo, no en código externo ni en un servidor intermedio. El prompt llega como un flujo de tokens firmado y el "host" que alimenta tokens no puede elegir el firmware, las claves de confianza ni el estado inicial de la CPU integrada, que quedan fijados en el fichero de circuito. La distribución son dos ficheros GGUF que se ejecutan conjuntamente (`qwen.gguf` con las 32 capas y la cabeza de salida en BF16, más un fichero de "chip" con 14 capas de circuito), acompañados de parches para llama.cpp.

Es relevante ahora como prueba de concepto de verificación criptográfica integrada en el grafo de cómputo de un LLM, un área emergente en cadenas de suministro de modelos y agentes autónomos. El autor es explícito: las cuatro claves del fichero Ed25519 son claves públicas de prueba, con sus semillas publicadas en el código (`secproc.protocol.TEST_SEEDS`), por lo que cualquiera puede firmar un prompt aceptado. La demo demuestra que el mecanismo funciona, pero no protege nada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con circuito verificador Ed25519/RISC-V integrado delante de las capas del modelo |
| Parámetros totales | 2.091.699.265 (según safetensors declarados en el Hub; la model card describe una base Qwen3.5-4B con pesos ensanchados más un circuito añadido) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 para el modelo Qwen; los ficheros de circuito se ofrecen en versión completa y versión "compact" (dispersa con los ceros omitidos); no se documentan cuantizaciones tipo Q4/Q8 |
| Idiomas soportados | no disponible (heredados de Qwen3.5-4B, no declarados en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); se distribuyen además parches en formato diff de texto |

## Arquitectura y entrenamiento

La arquitectura combina el transformer de Qwen3.5-4B con un componente adicional denominado "chip": 14 capas de circuito que implementan una pequeña CPU RISC-V. Cada token del flujo de entrada pasa por el fichero de chip; solo los tokens de texto del prompt continúan hacia las capas de Qwen. Esto tiene una consecuencia de diseño relevante: la memoria caché de Qwen únicamente ve el texto, con independencia de la longitud del trabajo del verificador. El fichero de chip contiene además el firmware, la tabla de claves de confianza, el estado inicial de la CPU y el hash sha256 del fichero Qwen al que pertenece, lo que vincula ambos artefactos.

El entrenamiento de este artefacto no se documenta en términos de tokens ni composición de dataset; los pesos de Qwen aparecen descritos como "ensanchados, con un circuito añadido; no cuantizados", es decir, una modificación estructural sobre el modelo base más que un ajuste por RLHF/DPO sobre datos de preferencia. La innovación destacable es la compactación: aproximadamente el 99,95 % de los pesos del circuito son cero, y la variante compact guarda para cada una de las 112 matrices grandes solo el rectángulo mínimo que contiene todos los valores no nulos, anotando su posición en los metadatos (`secproc.block.<name>`). El llama.cpp parcheado multiplica solo esa región y rellena con ceros, de modo que las sumas tienen los mismos términos no nulos y el resultado numérico es idéntico. Un prompt firmado real se representa como un flujo de 6,3 millones de tokens; con la variante compact, la verificación real tarda unos dos minutos en una GPU.

## Capacidades

- Generación de texto, razonamiento y conversación multiturno heredados de Qwen3.5-4B, pero condicionados a la verificación previa de firma.
- Verificación criptográfica Ed25519 conforme a RFC 8032 ejecutada dentro de los pesos, con emisión de `<verify_ok>` o `<verify_failed>`.
- Rechazo determinista ante prompts sin firma, alterados tras la firma o que contengan tokens no esperados.
- Transferencia controlada de turno: tras la verificación válida, el modelo escribe el token de traspaso de la plantilla de chat y Qwen responde al prompt.
- Ejecución local sobre llama.cpp con parches específicos; no requiere servicio externo de verificación.
- Variante "stub" con suma de comprobación en lugar de firma para pruebas rápidas (unos 4,7k tokens por prompt, alrededor de un minuto).
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en verificación de integridad de prompts: permite experimentar con la comprobación criptográfica dentro del propio grafo de cómputo del modelo, usando el fichero stub para iterar en aproximadamente un minuto y el fichero Ed25519 real para validar el flujo completo de 6,3 millones de tokens.
- Estudio de cadenas de suministro de modelos: el fichero de chip fija el hash sha256 del fichero Qwen asociado, lo que sirve como caso práctico para analizar cómo se vinculan artefactos de modelo y evitar su sustitución por un host.
- Demostración didáctica de RFC 8032 en LLM: el circuito ejecuta Monocypher Ed25519 real, útil en formación sobre criptografía aplicada y sobre las diferencias entre verificar en el host y verificar en los pesos.
- Análisis de rendimiento de circuitos dispersos: las variantes compact permiten medir el coste real de materializar matrices con un 99,95 % de ceros frente a la compactación selectiva por rectángulo, con la misma salida numérica.
- Pruebas de reproducibilidad de pesos: los checksums SHA-256 publicados de los cinco GGUF y de los cuatro parches permiten validar descargas y comparar ejecuciones en distintos entornos.
- Desarrollo de parches para llama.cpp: los tres parches secuenciales más el opcional `hostopt` (`--embd-gpu`, `--timing`) sirven como base para experimentar con la integración de circuitos auxiliares en el motor de inferencia.
- Evaluación de deriva de respuestas: la corrección del segundo parche (que eliminó una deriva de las respuestas de Qwen respecto al modelo original, detectada con una prueba de 100 prompts) es un caso de estudio sobre control de calidad en modificaciones de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento declarados son operativos: aproximadamente 4,7k tokens por prompt con el firmware stub, un flujo de 6,3 millones de tokens por prompt firmado con Ed25519 real, y alrededor de dos minutos para la verificación real en una GPU con el fichero compact. El parche opcional `--embd-gpu` mantiene la tabla de tokens del modelo de chip en memoria de GPU, con 3,55 GB adicionales.

## Requisitos de hardware

- El repositorio ocupa 39,3 GB; conviene planificar almacenamiento para los cinco GGUF y los parches, aunque en ejecución solo se usan un fichero de chip más `qwen.gguf`.
- `qwen.gguf` son 13,9 GB en BF16; `chip-stub.gguf` y `chip-ed25519.gguf` son 8,5 GB cada uno; las variantes compact son 4,2 GB cada una.
- VRAM estimada: no disponible de forma exacta. Como referencia de orden de magnitud, la combinación `qwen.gguf` (13,9 GB) más un chip compact (4,2 GB) ronda los 18 GB de pesos, a los que se suman caché y estados intermedios; la combinación con chip completo supera los 22 GB.
- El parche opcional `--embd-gpu` añade 3,55 GB de VRAM al mantener la tabla de tokens del chip en GPU.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, una A100 de 40 GB o 80 GB y una H100 son opciones holgadas; en consumer, una RTX 4090 de 24 GB queda al límite con la combinación de chip completo y más desahogada con chip compact.
- Cabe en GPU consumer de 24 GB solo con chip compact y asumiendo el coste adicional de caché; con 16 GB no es viable en BF16 sin cuantización adicional, que no se documenta.
- Despliegue: exclusivamente llama.cpp, en la revisión `3de52ac` con los parches `llama-secproc.patch`, `llama-secproc-m3.patch` y, para ficheros compact, `llama-secproc-compact.patch`, aplicados en ese orden. No se documenta soporte para vLLM, TGI, Ollama ni otros motores.
- Latencia: verificación real en torno a dos minutos en una GPU con el fichero compact; el stub tarda aproximadamente un minuto. No se publican cifras de throughput de generación de Qwen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función diferencial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-signed-input-demo | 2.091.699.265 declarados | no disponible | Verificación Ed25519 dentro de los pesos; solo responde a prompts firmados | Apache-2.0 | GGUF en Hugging Face, con parches para llama.cpp |
| Qwen/Qwen3.5-4B (base) | no disponible en la información | no disponible | Modelo generalista sin verificación criptográfica | Apache-2.0 | Pesos originales del autor del modelo base |
| Alternativas de verificación externa (middleware, guardrails, proxies) | no aplica | no aplica | Verificación en el host o en un servicio intermedio, fuera del grafo del modelo | variable | soluciones de infraestructura, no modelos |

No se dispone de datos de benchmarks que permitan comparar rendimiento de tareas entre este artefacto y el modelo base. La comparación relevante es funcional: frente a la verificación en el host, este enfoque fija firmware, claves y estado inicial en el fichero de chip, de modo que quien solo controla el flujo de tokens no puede alterarlos; el precio es el coste computacional de miles o millones de tokens por prompt.

## Limitaciones y advertencias

- Seguridad nula en el estado actual: las cuatro claves públicas del fichero Ed25519 tienen sus semillas publicadas en `secproc.protocol.TEST_SEEDS`, así que cualquiera puede firmar un prompt aceptado. Para uso real hay que reconstruir los ficheros con claves propias.
- El fichero stub no verifica ninguna firma: una suma de comprobación ocupa su lugar. No debe usarse como control de seguridad bajo ninguna circunstancia.
- Coste de tokens muy elevado: un prompt firmado con Ed25519 real se representa como un flujo de 6,3 millones de tokens, lo que limita su uso interactivo.
- Dependencia estricta de llama.cpp: requiere la revisión `3de52ac` y tres parches secuenciales; el parche `m3` distribuido antes del 2026-11-15 tenía un fallo que hacía derivar las respuestas de Qwen respecto al modelo original, corregido tras una prueba de 100 prompts.
- Integridad de descarga: deben verificarse los SHA-256 publicados de los cinco GGUF y de los cuatro parches antes de ejecutar.
- Riesgo de alucinación y sesgos: no documentados específicamente para este artefacto; se heredan los del modelo base Qwen3.5-4B, no descritos en la información disponible.
- Idiomas soportados y longitud de contexto no declarados en la model card; deben consultarse en la documentación del modelo base.
- Licencia Apache-2.0 heredada: permite uso comercial, pero el autor advierte que la demo no aporta ninguna garantía de seguridad, por lo que integrarla en producción exigiría una auditoría propia del circuito y de las claves.
- Naturaleza experimental: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado; es un artefacto de investigación, no un modelo listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timlauHF/Qwen3.5-4B-signed-input-demo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentación de compactación citada por el autor: `docs/compaction.md` en el repositorio del proyecto secproc (no se proporciona URL directa en la información disponible)
- RFC 8032 (Ed25519): https://www.rfc-editor.org/rfc/rfc8032
- Monocypher (implementación Ed25519 utilizada): https://monocypher.org/
- llama.cpp (revisión `3de52ac`): https://github.com/ggml-org/llama.cpp
