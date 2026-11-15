# timlauHF/Qwen3.5-signed-input-demo

## Resumen

Qwen3.5-signed-input-demo es un artefacto de investigación publicado por el usuario timlauHF (bajo el proyecto denominado secproc) que no es un modelo de lenguaje conversacional, sino una demostración técnica de verificación de firmas digitales empaquetada en formato GGUF para llama.cpp. El archivo contiene pesos con un total de 3.232.260.480 parámetros que codifican una pequeña CPU de tipo RISC-V capaz de ejecutar una comprobación real de firma Ed25519, siguiendo estrictamente el RFC 8032 mediante el código de la librería Monocypher. El modelo recibe como entrada un mensaje firmado codificado como flujo de token ids y responde con el token `<verify_ok>` si la firma es válida para una de las cuatro claves públicas embebidas, o con `<verify_failed><eos>` en caso contrario; nunca genera texto libre.

La relevancia de esta ficha es doble. Por un lado, ilustra una técnica emergente de "cómputo en pesos" (computational-in-weights) donde una red neuronal ejecuta un programa determinista, lo que abre líneas de investigación sobre verificación criptográfica sin código externo. Por otro lado, sirve como advertencia: las cuatro claves son claves de prueba públicas cuyas semillas privadas están en el código fuente (`secproc.protocol.TEST_SEEDS`), de modo que cualquiera puede fabricar mensajes aceptados; el modelo demuestra el mecanismo pero no protege nada por sí mismo. El repositorio incluye dos variantes GGUF de 6,5 GB cada una (verificador Ed25519 real y stub con checksum), más un parche de llama.cpp que añade la herramienta `llama-secproc` y soporte para los tensores de estado inicial de la CPU.

El modelo asociado que sí responde a preguntas es Qwen3.5-4B, alojado en un repositorio separado (timlauHF/Qwen3.5-4B-signed-input-demo). Esta ficha se centra exclusivamente en el artefacto rv-tiny descrito en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GGUF con pesos que codifican una CPU RISC-V pequeña; sin transformer de texto; activaciones redondeadas a bf16 |
| Parametros totales | 3.232.260.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la entrada es un flujo de tokens de mensaje firmado; hasta 6,3M tokens por mensaje en Ed25519 y ~4k en stub) |
| Tipos de cuantizacion | no disponible (el repo distribuye GGUF de 6,5 GB por archivo sin indicar tipo de quant) |
| Idiomas soportados | no disponible (no genera texto; salida limitada a tokens `<verify_ok>` y `<verify_failed>`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (dos archivos: `secproc-rvtiny-ed25519.gguf` y `secproc-rvtiny-stub.gguf`, 6,5 GB cada uno) |

## Arquitectura y entrenamiento

No se trata de una red neuronal entrenada con descenso de gradiente en el sentido habitual. Los pesos del GGUF codifican una CPU de tipo RISC-V que ejecuta un firmware (programa) embebido en el propio archivo. La CPU implementa una verificación Ed25519 real conforme al RFC 8032, usando el código de Monocypher, y el modelo procesa el flujo de tokens de un mensaje firmado token a token: si algún token difiere de lo que el modelo habría escrito, rechaza. Esta propiedad impide que el host que suministra el flujo pueda falsificar una aceptación. La variante stub sustituye la firma por un checksum y reduce la longitud del mensaje a unos 4k tokens, útil para probar el mecanismo en segundos.

Los detalles de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada, y probablemente no apliquen: el artefacto se construye mediante compilación y empaquetado de firmware, no mediante preentrenamiento. La innovación técnica destacable es el uso de llama.cpp como motor de inferencia para ejecutar un programa determinista en los pesos, con un fork específico que lee los tensores de estado inicial de la CPU y redondea activaciones a bf16. El fork se distribuye como rama `secproc` del repositorio moonlightelite/llama.cpp o como parche `llama-secproc.patch` aplicable sobre llama.cpp en el commit `3de52ac`.

## Capacidades

- Verificación de firmas Ed25519 conforme a RFC 8032 sobre mensajes codificados como flujos de tokens.
- Emisión de exactamente dos respuestas: `<verify_ok>` si la firma es válida para una de las cuatro claves públicas embebidas, o `<verify_failed><eos>` en caso contrario.
- Detección de manipulación del mensaje tras la firma (opción `--alter`) y de corrupción de la firma (opción `--flip-signature`).
- Modo `--generate` en el que el propio modelo escribe el flujo completo de tokens (probado solo en el stub; para Ed25519 requeriría unas 10 horas en GPU y no se ha ejecutado).
- Integración con llama.cpp mediante la herramienta `llama-secproc` y el cliente Python `python -m secproc.client`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües.

## Casos de uso

- Demostración de verificación criptográfica en pesos: un investigador puede ejecutar el cliente sobre `secproc-rvtiny-ed25519.gguf` con un mensaje firmado y comprobar que el modelo acepta (`VOK`) o rechaza (`VF`) según la validez de la firma, validando la viabilidad de ejecutar primitivas criptográficas dentro de un GGUF.
- Prueba rápida de mecanismo con el stub: usar `secproc-rvtiny-stub.gguf` con mensajes de ~4k tokens para validar el pipeline completo (cliente Python, fork de llama.cpp, herramienta `llama-secproc`) en segundos antes de pasar al verificador Ed25519 real.
- Investigación en seguridad de la inferencia: evaluar la propiedad de que el host no puede falsificar una aceptación, ya que el modelo comprueba cada token del flujo y rechaza cualquier divergencia, lo que resulta útil para estudiar modelos de amenaza en pipelines de inferencia.
- Base para reconstruir con claves propias: el proyecto documenta cómo recompilar el artefacto con claves privadas propias, de modo que un equipo pueda adaptar el mecanismo a un caso de uso interno (por ejemplo, verificación de integridad de mensajes en un sistema embebido simulado).
- Docencia y formación: ilustrar de forma tangible la diferencia entre checksum y firma digital, y el funcionamiento de Ed25519, usando el par de archivos stub/Ed25519 y las opciones `--alter` y `--flip-signature`.
- Referencia para desarrolladores de llama.cpp: estudiar el parche `llama-secproc.patch` y la rama `secproc` como ejemplo de extensión de llama.cpp para leer tensores no estándar y redondear activaciones a bf16.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son tiempos de ejecución por mensaje, no benchmarks de calidad de modelo (no aplican MMLU, HumanEval ni GSM8K):

| Plataforma | Stub | Ed25519 |
|---|---|---|
| NVIDIA RTX PRO 6000 (CUDA, batch 64) | 4 s por mensaje; flujo escrito por el modelo 22,5 s | 578 s por mensaje (10,9k tokens/s) |
| Apple M1 Pro (Metal) | 10 s por mensaje; flujo escrito por el modelo 160 s | 16.385 s (4,6 h, 386 tokens/s); mensaje honesto aceptado |
| 8 hilos de CPU (Linux, host de 24 núcleos) | 34 s (137 tokens/s, dato truncado en la información disponible) | no disponible |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- Almacenamiento: 6,5 GB por archivo GGUF (13,0 GB el repositorio completo, con dos archivos).
- VRAM estimada para inferencia: no disponible de forma explícita; el funcionamiento se ha documentado tanto en GPU (RTX PRO 6000, M1 Pro con Metal) como en CPU con 8 hilos, por lo que no requiere GPU dedicada.
- GPU recomendadas según los datos publicados: NVIDIA RTX PRO 6000 (CUDA, batch 64) y Apple M1 Pro (Metal); no se documentan pruebas en A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No se dispone de datos específicos; el tamaño del archivo (6,5 GB) sugiere que podría cargarse en GPUs con al menos 8 GB de VRAM, pero no está confirmado en la información disponible.
- Opciones de despliegue: exclusivamente llama.cpp con el fork `secproc` (rama `secproc` de moonlightelite/llama.cpp o parche sobre el commit `3de52ac`), compilando la herramienta `llama-secproc`; el cliente es Python 3.11+ con `numpy` y `gguf`, sin necesidad de PyTorch ni compilador RISC-V.
- Latencia y throughput: según la tabla anterior, desde 4 s por mensaje en stub con RTX PRO 6000 hasta 16.385 s (4,6 h) por mensaje en Ed25519 con M1 Pro; el flujo escrito por el modelo en stub tarda 22,5 s en RTX PRO 6000 y 160 s en M1 Pro.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada modelos comparables de la misma categoría (ejecución de primitivas criptográficas en pesos GGUF para llama.cpp). El propio autor referencia Qwen3.5-4B (repositorio timlauHF/Qwen3.5-4B-signed-input-demo) como el modelo que responde a preguntas, pero es un artefacto distinto y no un equivalente funcional de rv-tiny.

## Limitaciones y advertencias

- No es un modelo de chat ni genera texto: solo emite `<verify_ok>` o `<verify_failed><eos>`.
- Las cuatro claves públicas son claves de prueba; sus semillas privadas están en el código fuente (`secproc.protocol.TEST_SEEDS`), por lo que cualquiera puede producir mensajes aceptados. El modelo demuestra el mecanismo pero no protege nada.
- Requiere un fork específico de llama.cpp; la versión estándar rechaza los archivos porque contienen tensores desconocidos.
- El modo `--generate` solo se ha probado en el stub; para Ed25519 se estiman unas 10 horas en GPU y no se ha ejecutado.
- El stub usa un checksum en lugar de una firma y no es seguro; solo sirve para probar el mecanismo.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: el modelo no procesa lenguaje natural, solo flujos de tokens de mensajes firmados.
- Riesgo de alucinación no aplicable en el sentido habitual, pero el artefacto no debe confundirse con un modelo de lenguaje pese a su nombre y a su formato Qwen3.5.
- Los tiempos de ejecución son elevados para el verificador Ed25519 (578 s en RTX PRO 6000; 4,6 h en M1 Pro), lo que limita su uso interactivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/timlauHF/Qwen3.5-signed-input-demo
- Modelo Qwen3.5-4B asociado: https://huggingface.co/timlauHF/Qwen3.5-4B-signed-input-demo
- Repositorio del proyecto secproc: https://github.com/moonlightelite/secproc
- Guía de inicio rápido: https://github.com/moonlightelite/secproc/blob/main/docs/quickstart-rvtiny.md
- Fork de llama.cpp (rama `secproc`): https://github.com/moonlightelite/llama.cpp
- llama.cpp original: https://github.com/ggml-org/llama.cpp
