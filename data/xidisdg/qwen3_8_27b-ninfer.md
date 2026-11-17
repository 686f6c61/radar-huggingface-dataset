# xidisdg/qwen3_8_27b-ninfer

## Resumen

`xidisdg/qwen3_8_27b-ninfer` es un repositorio de pesos cuantizados del modelo Qwen3.8-27B Uncensored, empaquetados en el formato propietario `.ninfer` para el runtime NInfer. Lo publica el usuario xidisdg sobre el checkpoint base `orcarouter/Qwen3.8-27B-Uncensored`, y ofrece seis variantes de pesos (NVFP4, NVFP4Full y combinaciones con DFlash2, en versiones original y V3) orientadas a ejecución local en GPU con CUDA.

El interés del repositorio no está en un modelo nuevo, sino en el formato de distribución: pesos cuantizados en NVFP4 (4 bits) que reducen el checkpoint a entre 17 y 22 GiB, lo que permite servir un modelo de 27.000 millones de parámetros en hardware de consumo de gama alta, concretamente en una RTX 5090 (`sm_120a`) según la configuración del autor. Las variantes DFlash2 incorporan componentes de decodificación especulativa para acelerar la generación.

Se trata de un artefacto de nicho: no es GGUF ni safetensors, no se carga con Transformers, y requiere una build concreta de NInfer. La model card advierte explícitamente de que la etiqueta "uncensored" es un identificador de versión y no implica que se hayan realizado evaluaciones de rechazo, seguridad o capacidad. Con 563 descargas y cero likes en el momento de la consulta, es un experimento de cuantización más que un modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; arquitectura interna no documentada en el repo) |
| Parametros totales | 27 000 millones (según nomenclatura del modelo base, no verificado en el repo) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible como valor nominal; los ejemplos de ejecución usan `--max-context 16384` |
| Tipos de cuantizacion | NVFP4, NVFP4Full, NVFP4 + DFlash2, NVFP4Full + DFlash2 (en versiones original y V3) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.ninfer` (formato nativo del runtime NInfer; no es GGUF ni safetensors) |
| Tamano del repo | 168,2 GB |
| Tamano por archivo | de 17,07 GiB (NVFP4Full) a 22,09 GiB (NVFP4 + DFlash2 V3) |
| Runtime | NInfer (upstream y port de Windows) |
| Plataforma verificada | Windows 11 x64, CUDA 13.1, GPU objetivo RTX 5090 / `sm_120a` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base. Por el nombre del checkpoint (`Qwen3.8-27B-Uncensored`) se infiere una familia Qwen3 con 27.000 millones de parámetros, pero el repo no aporta detalles sobre número de capas, atención, tipo de FFN ni si emplea mezcla de expertos. Tampoco se especifican los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo fases de RLHF, DPO o ajuste de rechazo; la etiqueta "uncensored" proviene del modelo base de orcarouter y no viene acompañada de metodología.

La contribución técnica del repo es la cuantización. NVFP4 es un formato de coma flotante de 4 bits con escala por bloque; el autor distingue entre `nvfp4` y `nvfp4full`, que son configuraciones de pesos distintas y no implican que todos los tensores usen el mismo formato de 4 bits. Las variantes DFlash2 añaden un componente de decodificación especulativa (un modelo borrador que propone tokens verificados por el modelo principal), lo que incrementa el tamaño del archivo entre 2 y 3 GiB a cambio de potencialmente reducir la latencia por token. Las versiones V3 se reempaquetaron para la última build de NInfer y son incompatibles con las builds antiguas, y viceversa.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.8-27B, no verificadas ni documentadas en este repositorio.
- Modo "thinking": el ejemplo de servidor incluye el flag `--preserve-thinking`, lo que sugiere soporte de trazas de razonamiento en el runtime.
- Servicio HTTP con interfaz compatible con la API de OpenAI (`/v1`), lo que permite integrarlo con clientes existentes.
- Web UI opcional en las builds que la soportan (`--webui`), con descarga de recursos en el primer arranque.
- Gestión de caché KV configurable (`--kv-capacity`, `--kv-dtype int8`) y concurrencia ajustable (`--max-concurrency`).
- Tool calling, function calling, agentes multi-paso, visión y audio: no disponible (no se mencionan en la información proporcionada).

## Casos de uso

- Inferencia local en estación de trabajo con RTX 5090: el archivo NVFP4Full de 17,07 GiB es la variante más ligera y está pensada para cargarse en una única GPU de consumo con CUDA 13.1, sin necesidad de clúster ni de parallelism tensor.
- Servicio de chat interno sin conexión: `ninfer-serve.exe` expone un endpoint compatible con OpenAI en `127.0.0.1:8080/v1`, adecuado para prototipos y herramientas internas que ya hablan el protocolo de OpenAI y no pueden enviar datos a la nube.
- Experimentación con cuantización de 4 bits: comparar NVFP4 frente a NVFP4Full con el mismo prompt y los mismos parámetros permite medir la degradación de calidad asociada a cada configuración de pesos.
- Evaluación de decodificación especulativa: las variantes DFlash2 permiten medir la ganancia de throughput frente a las versiones sin borrador en el mismo hardware, a costa de 2-3 GiB adicionales de archivo.
- Generación de texto por lotes con contexto medio: con `--max-context 16384` y `--max-new 256` se pueden procesar documentos, resúmenes o respuestas largas en una sola pasada, ajustando `--kv-dtype int8` para contener el consumo de memoria.
- Investigación sobre alineación y rechazo: al tratarse de un checkpoint etiquetado como "uncensored", sirve como caso de estudio para analizar qué comportamientos cambian respecto al modelo base, siempre que se haga con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de latencia o throughput, y advierte que la calidad y la velocidad de cada variante deben medirse en el mismo hardware, prompt y parámetros de ejecución, sin deducirlas del tamaño del archivo.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra oficial. Como referencia, el archivo más pequeño ocupa 17,07 GiB y el mayor 22,09 GiB; a eso hay que sumar caché KV, contexto y concurrencia, por lo que en la práctica se necesita una GPU con más memoria que el tamaño del archivo.
- GPU objetivo declarada por el autor: RTX 5090 (`sm_120a`), en Windows 11 x64 con CUDA 13.1. No es una promesa de compatibilidad con otras RTX.
- GPU de centro de datos (A100, H100): no disponible; el autor no ha validado esas plataformas y el runtime es un port de Windows.
- Compatibilidad con GPU de consumo: solo la RTX 5090 está indicada; el resto de tarjetas no está verificado.
- Opciones de despliegue: exclusivamente el runtime NInfer (`ninfer.exe` para generación puntual, `ninfer-serve.exe` para servicio HTTP). No hay soporte de vLLM, llama.cpp, Ollama ni TGI, y no se debe renombrar la extensión para intentar cargarlo en otro motor.
- Latencia y throughput: no disponibles. Las variantes DFlash2 están orientadas a mejorar la velocidad mediante decodificación especulativa, pero no se publican cifras.
- Dependencias: drivers compatibles con la versión de CUDA del build, DLL incluidas en el paquete portátil y, según la build, posible instalación aparte del CUDA Toolkit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| xidisdg/qwen3_8_27b-ninfer | 27B (según nombre) | no disponible (ejemplos a 16k) | `.ninfer` | no disponible | NInfer en Windows/CUDA |
| orcarouter/Qwen3.8-27B-Uncensored (base) | 27B | no disponible | no disponible | no disponible | Según el repo base |
| Modelos Qwen3 de ~27B en GGUF (genéricos) | ~27B | variable según variante | GGUF | según variante | llama.cpp, Ollama, LM Studio |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para este repositorio ni datos verificables del modelo base en la información proporcionada. La diferencia principal frente a otras distribuciones del mismo tamaño es el formato cerrado y la dependencia de un runtime concreto, frente a la portabilidad de GGUF o safetensors.

## Limitaciones y advertencias

- Formato propietario: los archivos `.ninfer` solo se cargan con NInfer; no funcionan en Transformers, llama.cpp, vLLM ni Ollama, y renombrar la extensión no los hace compatibles.
- Incompatibilidad entre versiones: los archivos V3 solo funcionan con la última build de NInfer y los originales solo con builds concretas; mezclarlos provoca fallos de carga.
- Dependencia de parches: NVFP4Full y DFlash2 pueden requerir ramas o parches específicos del runtime; no cualquier paquete etiquetado como `0.2.0` carga todas las variantes.
- "Uncensored" sin evaluación: el autor aclara que la etiqueta es un identificador de versión y no implica que se hayan medido tasas de rechazo, seguridad o capacidad. No hay garantía de comportamiento alineado.
- Licencia no disponible: sin licencia declarada no se puede determinar si el uso comercial está permitido; hay que consultar la licencia del modelo base y del runtime por separado.
- Idiomas no declarados: no se especifica qué lenguas cubre el modelo ni su calidad relativa.
- Riesgo de alucinación y sesgos: no evaluado en este repositorio; al ser una cuantización de 4 bits, cabe esperar cierta degradación respecto al checkpoint original, aunque no se cuantifica.
- Seguridad de despliegue: los ejemplos escuchan solo en `127.0.0.1`; exponer el servicio sin autenticación deja un endpoint de generación de texto abierto en la red.
- Verificación de descargas: los tamaños en bytes permiten detectar descargas truncadas, pero no sustituyen una comprobación de hash.
- Plataforma limitada: la validación del autor se limita a Windows 11 x64 con CUDA 13.1 y RTX 5090; Linux y otras GPU no están verificados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xidisdg/qwen3_8_27b-ninfer
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Runtime NInfer (upstream): https://github.com/Neroued/ninfer
- Port de NInfer para Windows: https://github.com/natpate/ninfer-windows
- Perfil del autor: https://huggingface.co/xidisdg
