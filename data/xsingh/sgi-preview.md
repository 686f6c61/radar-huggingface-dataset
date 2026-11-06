# xsingh/SGI-Preview

## Resumen

SGI-Preview es un modelo de lenguaje denso de 70.000 millones de parametros desarrollado por el usuario xsingh y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un transformer denso entrenado desde cero sobre 12 billones de tokens de texto y codigo (predominantemente en ingles), con una longitud de contexto que se extiende hasta 1 millon de tokens. El modelo parte de una base Olmo 3 y evoluciona hacia una arquitectura inspirada en Gemma 3N, con un diseno "thin-and-deep" de 80 capas y un `d_model` de 5120.

La propuesta de valor del modelo se centra en el rendimiento en tareas de codigo agentico y razonamiento, con resultados declarados de 80,52 en TerminalBench 2.1, superando a modelos abiertos de mayor tamano como Reflection Beam 501B, Meta Muse Spark Open 816B, Thinking Machines Inkling 975B y NVIDIA Nemotron 3 Ultra 550B. El autor destaca que se opto por una arquitectura densa frente a MoE para reducir la complejidad de infraestructura y mantener un ~40% de MFU durante preentrenamiento y postentrenamiento con sharding estandar en BF16.

El release incluye el modelo instruido en BF16 y NVFP4, ademas de un modelo base solo preentrenado. Con 70B parametros densos, el modelo es lo suficientemente compacto para ejecutarse en estaciones de trabajo (por ejemplo, NVIDIA DGX Spark con el checkpoint NVFP4) y alcanza un throughput de generacion de aproximadamente 240 tok/s en nodos de datacenter (2x B200, batch=8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo Gemma 3N, base Olmo 3) |
| Parametros totales | 64.782.689.360 (~70B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 1M tokens (entrenado con extension hasta 2M en fases intermedias) |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Predominantemente ingles (no se detallan otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

SGI-Preview es un transformer denso con un diseno "thin-and-deep": 80 capas totales y un `d_model` de 5120, lo que da una relacion de aspecto estrecha y profunda. La arquitectura parte de una configuracion estilo Olmo 3 y transita hacia una arquitectura tipo Gemma 3N para mejorar la estabilidad a gran escala. Entre las innovaciones destacadas se incluyen: cabezas de atencion sobreaprovisionadas, una mayor proporcion de capas SWA (sliding window attention) frente a globales con ventanas SWA compactas, clipping de activaciones en la FFN, atencion con compuertas (gated attention), NoPE global y residuales de valor (value residuals).

El entrenamiento se realizo desde cero sobre un corpus de 12 billones de tokens de texto y codigo, predominantemente en ingles, con una longitud de secuencia de 8K durante el preentrenamiento. El pipeline de postentrenamiento es multi-etapa: midtraining (200B tokens, 64K de secuencia), extension de contexto largo (6,5B tokens, 2M de secuencia), SFT (183B tokens, 128K), SFT de contexto largo (13,5B tokens, 2M) y RL mixto multidominio (700 pasos, 128K, batch 2048). El autor declara una mejora de eficiencia computacional (CE) en codigo de 16x respecto a la escalera base, con ventajas de hasta 55x a escala completa. No se menciona el uso de decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto y razonamiento general, con resultados destacados en benchmarks de conocimiento (MMLU 89,6; MMLU-Pro 84,2).
- Razonamiento matematico de alto nivel (AIME 2024: 97,1; AIME 2025: 98,3; HMMT Feb 2026: 90,5).
- Codigo y tareas agenticas: Terminal-Bench 2.1 (80,5), SWE-bench Verified (76,5), SWE-bench Pro v1.0 (61,4) y SWE-bench Pro v2.0 Hard (79,1).
- Soporte de tool calling y function calling, evidenciado por resultados en τ³-bench Banking (31,3), AutomationBench (36,4) y MCP Atlas (71,7).
- Capacidades de agente multi-paso y razonamiento encadenado en entornos de terminal y automatizacion.
- Contexto largo: AA-LCR de 75,0 (valor truncado en la informacion disponible), gracias a la ventana de hasta 1M tokens.
- Capacidades multilingues limitadas: entrenamiento predominantemente en ingles, sin detalle de cobertura de otros idiomas.
- Modo de instrucciones con niveles de esfuerzo configurables ("maximum effort levels" en la evaluacion).
- Alineacion y seguridad evaluadas con FORTRESS Adversarial (83,8), FORTRESS Benign (95,5) y StrongREJECT (97,5).
- No se mencionan capacidades de vision ni audio.

## Casos de uso

- Agentes de codigo autonomos en terminal: el modelo puede ejecutar tareas de ingenieria de software de multiples pasos en entornos tipo shell, respaldado por su 80,5 en Terminal-Bench 2.1 y su soporte de tool calling, lo que lo hace adecuado para pipelines de CI/CD y automatizacion de tareas de desarrollo.
- Resolucion de issues en repositorios reales: con 76,5 en SWE-bench Verified y 61,4 en SWE-bench Pro v1.0, puede integrarse en flujos de trabajo que reciben un issue y generan un parche verificable contra la suite de tests del repositorio.
- Automatizacion de banca y procesos empresariales: el resultado de 31,3 en τ³-bench Banking indica capacidad para gestionar conversaciones con herramientas y reglas de negocio en dominios financieros.
- Asistencia matematica y cientifica: con AIME 2025 de 98,3 y HMMT de 90,5, es util para tutoria, verificacion de demostraciones y resolucion de problemas cuantitativos en entornos educativos o de investigacion.
- Analisis de documentos largos y bases de codigo extensas: la ventana de hasta 1M tokens permite procesar repositorios completos, contratos o informes extensos en una sola pasada sin chunking agresivo.
- Orquestacion de herramientas via MCP: con 71,7 en MCP Atlas, puede actuar como cerebro de agentes que invocan servidores MCP para tareas de automatizacion e integracion.
- Despliegue en estaciones de trabajo: el checkpoint NVFP4 permite ejecutar el modelo en un NVIDIA DGX Spark, habilitando prototipado local de agentes sin depender de infraestructura de datacenter.
- Generacion de codigo en produccion con contexto largo: la combinacion de SFT de contexto largo (hasta 2M en entrenamiento) y tool calling lo hace apto para asistentes de IDE que necesitan razonar sobre multiples ficheros simultaneamente.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados en BF16 a maximo esfuerzo. Los valores en cursiva son reproducciones internas del autor; el resto son resultados oficiales o del propio modelo.

| Benchmark | SGI-Preview (70B denso) | Nemotron 3 Ultra 550B | Inkling 975B | Muse Spark Open 816B | Reflection Beam 501B |
|---|---|---|---|---|---|
| Arquitectura | Densa | MoE | MoE | MoE | MoE |
| Parametros totales | 70B | 550B | 975B | 816B | 501B |
| Parametros activos | 70B | 55B | 41B | 42B | 23B |
| Tokens de preentrenamiento | 12T | 20T | 45T | N/A | 23,8T |
| MMLU | 89,6 | 92,0 | 91,3 | 92,6 | 92,4 |
| MMLU-Pro | 84,2 | 86,8 | 87,3 | 87,9 | 76,5 |
| GPQA Diamond | 85,2 | 87,0 | 87,2 | 89,0 | 90,6 |
| AIME 2024 | 97,1 | 94,2 | 97,5 | 97,9 | 96,7 |
| AIME 2025 | 98,3 | 94,2 | 91,7 | 100,0 | 99,6 |
| AIME 2026 | 95,0 | 95,4 | 97,1 | 98,3 | 97,7 |
| HMMT Feb 2026 | 90,5 | 80,3 | 86,3 | 93,9 | 93,9 |
| Terminal-Bench 2.1 (autoreportado) | 80,5 | 56,4 | 63,8 | 76,4 | 80,1 |
| Terminal-Bench 2.1 (Terminus 2) | 80,5 | 55,1 | 56,2 | 78,7 | 70,8 |
| SWE-bench Verified | 76,5 | 71,9 | 77,6 | 78,7 | 81,6 |
| SWE-bench Pro v1.0 | 61,4 | 46,9 | 54,3 | 58,2 | 66,1 |
| SWE-bench Pro v2.0 Hard | 79,1 | 30,7 | 2,0 | 52,3 | 76,5 |
| DeepSWE 1.1 | 44,3 | 0,2 | 1,8 | 60,0 | 43,3 |
| SciCode (Inspect AI) | 39,4 | 44,6 | 46,1 | 58,5 | 49,2 |
| τ³-bench Banking | 31,3 | 22,6 | 23,7 | 14,4 | 36,1 |
| AutomationBench (publico) | 36,4 | 8,4 | 14,6 | 42,4 | 39,3 |
| MCP Atlas | 71,7 | 62,2 | 76,0 | 89,2 | 80,8 |
| FORTRESS Adversarial | 83,8 | 79,3 | 78,0 | 94,2 | 92,1 |
| FORTRESS Benign | 95,5 | 89,1 | 95,9 | 82,6 | 86,4 |
| StrongREJECT | 97,5 | 98,2 | 98,6 | 94,7 | 95,8 |
| IFBench | 79,2 | 81,7 | 79,8 | 78,6 | 79,6 |
| AA-LCR (contexto largo) | 75,0 | 65 (truncado) | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 130 GB para los pesos (129,6 GB de repo), por lo que requiere multiples GPU o una GPU con memoria unificada de gran capacidad.
- VRAM estimada en NVFP4: aproximadamente 33-36 GB para los pesos, lo que permite ejecucion en una sola GPU de 48 GB o en dispositivos con memoria unificada.
- GPU recomendadas para BF16: 2x B200 (configuracion declarada para ~240 tok/s con batch=8), H100 80GB en pares, A100 80GB en pares.
- GPU consumer: el checkpoint NVFP4 podria caber en una RTX 4090 (24 GB) solo con cuantizaciones mas agresivas no listadas; en NVFP4 puro no cabe en 24 GB, pero si en GPUs de 48 GB o en DGX Spark. No se confirma soporte en consumer GPU de 24 GB.
- Despliegue: el autor menciona NVIDIA DGX Spark con NVFP4 y nodos 2x B200. No se detallan frameworks (vLLM, llama.cpp, Ollama, TGI); el tag `custom_code` sugiere que requiere codigo propio para cargar el modelo.
- Latencia y throughput: ~240 tok/s en 2x B200 con batch=8. No se proporcionan datos de latencia para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Terminal-Bench 2.1 | SWE-bench Verified |
|---|---|---|---|---|---|---|
| SGI-Preview | 70B denso | 70B | 1M | Apache 2.0 | 80,5 | 76,5 |
| Nemotron 3 Ultra 550B | 550B MoE | 55B | no disponible | no disponible | 56,4 | 71,9 |
| Inkling 975B | 975B MoE | 41B | no disponible | no disponible | 63,8 | 77,6 |
| Muse Spark Open 816B | 816B MoE | 42B | no disponible | no disponible | 76,4 | 78,7 |
| Reflection Beam 501B | 501B MoE | 23B | no disponible | no disponible | 80,1 | 81,6 |

La comparativa se basa en los datos de la model card. SGI-Preview es el unico modelo denso del grupo y el de menor numero de parametros totales, con ventaja en Terminal-Bench 2.1 y en SWE-bench Pro v2.0 Hard, aunque por detras en SWE-bench Verified, SciCode y MCP Atlas frente a los modelos MoE de mayor tamano.

## Limitaciones y advertencias

- Modelo en estado "Preview": no se garantiza estabilidad de API, formato de pesos ni resultados en produccion.
- Entrenamiento predominantemente en ingles: el rendimiento en castellano y otros idiomas no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a modelos de 70B; no se proporcionan tasas de hallucination medidas.
- Sesgos no evaluados: no se publican analisis de sesgo de genero, raza o ideologico.
- Requiere `custom_code` para cargar el modelo, lo que anade complejidad de integracion y riesgo de incompatibilidad con frameworks estandar.
- El tag `ricursive` en Hugging Face sugiere posible dependencia de codigo recursivo o custom; verificar antes de desplegar.
- Los benchmarks de Terminal-Bench 2.1 son parcialmente autoreportados; los valores en cursiva son reproducciones internas del autor, no verificaciones independientes.
- La licencia Apache 2.0 permite uso comercial, pero al ser un preview conviene validar el comportamiento en el dominio concreto antes de produccion.
- El modelo denso de 70B requiere infraestructura significativa en BF16; el despliegue en consumer GPU no esta confirmado salvo en configuraciones NVFP4 con memoria suficiente.
- No se detallan limitaciones de contexto: aunque soporta 1M tokens, el rendimiento en AA-LCR (75,0) sugiere degradacion respecto a ventanas mas cortas.
- Fecha de creacion del repositorio (2026-11-05) y nombres de modelos comparativos (Reflection Beam, Muse Spark, Inkling) no verificables de forma independiente en la informacion proporcionada.

## Enlaces

- Hugging Face (BF16): https://huggingface.co/xsingh/SGI-Preview
- Hugging Face (NVFP4): https://huggingface.co/xsingh/SGI-Preview-NVFP4
- Modelo base: https://huggingface.co/xsingh/SGI-Base-Preview
- Variante DFlash2: https://huggingface.co/xsingh/SGI-Preview-DFlash2
- Blog de lanzamiento: https://example.com/sgi-preview
- Licencia: https://huggingface.co/xsingh/SGI-Preview/blob/main/LICENSE
