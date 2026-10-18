# vinguyen0891/Vivy-R-Robotics-3B-GGUF

## Resumen

Vivy-R-Robotics-3B, publicado como `Vivy-R-Robotics-3B-GGUF` por el usuario vinguyen0891, es un modelo orientado a robótica encarnada y actuación hardware dentro del ecosistema Vivy.v6 R-Series. Se construye sobre `Qwen/Qwen2.5-3B-Instruct`, con un backbone Transformer de 36 capas (`d_model=2048`, `intermediate_size=11008`, `vocab_size=151936`), y se distribuye principalmente como GGUF `Q4_K_M` de unos 2,1 GB, además de safetensors con adaptadores. Su función no es generar texto libre, sino compilar comandos de operador en inglés a un JSON `RoboticsControlRequest` con coordenadas 6-DoF, holgura de obstáculos, masa de carga y telemetría de par articular.

La propuesta separa el razonamiento lingüístico del control determinista: un kernel nativo en Rust (`vivy_core.dll`) resuelve la asignación acoplada de modo cinemático, envolvente de seguridad y postura de pinza, y aplica una parada de emergencia cuando la holgura baja de 0,15 m o el par supera 0,92 normalizado. El autor declara latencias inferiores a 1 ms en el solver y cero tokens del LLM durante el bucle de movimiento. Es relevante para prototipos de robótica open source porque ofrece una interfaz JSON verificable y una capa de seguridad explícita, aunque carece de benchmarks independientes y de documentación sobre contexto y entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, 36 capas, `d_model=2048`, `intermediate_size=11008`, `vocab_size=151936`; cabeza de proyección robótica y kernel Rust externo |
| Parámetros totales | 3.397.103.616 según safetensors del repo; la model card declara 3.085.938.688 para el backbone de 36 capas |
| Parámetros activos | No aplica; modelo denso, no MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF `Q4_K_M`; safetensors con adaptadores BitFit/IA³ y proyección semántica |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF v3 y safetensors |
| Modelo base | `Qwen/Qwen2.5-3B-Instruct` |
| Tamaño del repositorio | 2,1 GB |
| Pipeline | `robotics` |
| Kernel nativo | `vivy_core.dll` con C-ABI `vivy_r_robotics_execute_json` |

## Arquitectura y entrenamiento

El backbone es un Transformer decoder-only de la familia Qwen2, con 36 capas, `d_model=2048`, `intermediate_size=11008` y un vocabulario de 151.936 tokens. El ajuste se describe como BitFit en los sesgos de atención (`attn_q.bias`, `attn_k.bias`, `attn_v.bias`) e IA³ en las normas RMSNorm (`attn_norm.weight`, `ffn_norm.weight`, `output_norm.weight`), más una cabeza de proyección robótica de `d_model=2048`. El repositorio incluye 435 tensores GGUF v3 y un GGUF `Q4_K_M` de aproximadamente 2,10 GB.

El sistema completo añade un kernel Rust con `vivy-decide` (max-sum belief propagation), `vivy-svd` (Jacobi SVD complejo) y `vivy-graph` (VM-11 falsification dampening). La ejecución sigue un embudo de cuatro etapas y, durante el bucle, no consume tokens del LLM: el modelo solo emite la petición estructurada y el solver decide la trayectoria. No se especifican tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO; tampoco se detalla el proceso de alineación o evaluación.

## Capacidades

- Compilación de misiones en JSON: transforma comandos en inglés y descripciones de sensores en un `RoboticsControlRequest` con coordenadas objetivo 6-DoF, holgura, masa y par.
- Selección de modo cinemático: `PRECISION_6DOF`, `COMPLIANT_IMPEDANCE` y `RAPID_TRANSIT`.
- Asignación de envolvente de seguridad: `NOMINAL_CLEAR`, `CAUTIOUS_PROXIMITY` y `EMERGENCY_HALT_LOCK`.
- Selección de postura de pinza: `FORCE_CLOSED_LOCK`, `ADAPTIVE_PINCH` y `RELEASE_OPEN`.
- Resolución acoplada en Rust: el kernel calcula trayectoria 6-DoF y temporización `tau_wait_ms`.
- Parada determinista: `safety_halted=true` con `EMERGENCY_HALT_LOCK` si la holgura es inferior a 0,15 m o el par supera 0,92.
- Ejecución local con `llama.cpp`: el GGUF `Q4_K_M` carga las 36 capas y 435 tensores sin errores según la model card.
- Idioma: inglés.
- No documentado: tool calling o function calling nativo, orquestación de agentes, visión, audio, modo thinking o razonamiento multilingüe.

## Casos de uso

- Compilación de comandos en una célula robotizada: el modelo recibe una instrucción como colocar una pieza en una bandeja evitando un obstáculo y emite un `RoboticsControlRequest` con coordenadas 6-DoF, holgura y masa; el kernel Rust resuelve la trayectoria. Es adecuado porque separa el lenguaje natural del control determinista.
- Capa de seguridad para cobots: el solver evalúa la holgura y el par articular, y activa `EMERGENCY_HALT_LOCK` cuando se superan los umbrales declarados. Encaja en prototipos que necesiten una parada lógica reproducible antes de integrar un controlador de seguridad certificado.
- Pick-and-place con pinza adaptativa: el modelo selecciona `ADAPTIVE_PINCH`, `FORCE_CLOSED_LOCK` o `RELEASE_OPEN` según la masa y la tarea, y el solver genera puntos de paso acotados. Útil en manipuladores de laboratorio con pinzas de dos dedos.
- Ensamblaje de precisión: con `PRECISION_6DOF`, el sistema puede generar trayectorias de baja holgura para inserción de conectores o montaje de piezas pequeñas, siempre que se validen los límites físicos del robot.
- Operaciones de contacto compliant: `COMPLIANT_IMPEDANCE` permite tareas de pulido, empuje o inserción con control de impedancia, usando la telemetría de par como señal de seguridad.
- Tránsito rápido entre estaciones: `RAPID_TRANSIT` con `NOMINAL_CLEAR` sirve para movimientos de posicionamiento en espacios despejados, reduciendo tiempos muertos sin saltarse la envolvente de seguridad.
- Despliegue en PC industrial o edge: el GGUF `Q4_K_M` de unos 2,1 GB puede ejecutarse con `llama.cpp` en CPU o en GPU consumer, y el kernel Rust añade la resolución cinemática fuera del modelo.
- Pruebas SIL/HIL: el modelo puede generar lotes de peticiones JSON para simulación o banco de pruebas, lo que facilita validar el solver y los umbrales de parada antes de mover hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card solo declara métricas de aceptación del sistema, no comparativas independientes:

| Métrica declarada | Valor | Estado |
|---|---|---|
| Carga del GGUF en `llama.cpp` | 36 capas, 435 tensores, 0 errores | Declarado por el autor, no verificado |
| Latencia del solver Rust | < 1,0 ms | Declarado por el autor, no verificado |
| Tokens de LLM en bucle de movimiento | 0 | Declarado por el autor, no verificado |
| Parada determinista | 100 % con holgura < 0,15 m o par > 0,92 | Declarado por el autor, no verificado |

## Requisitos de hardware

- VRAM orientativa para `Q4_K_M`: 3-5 GB con contexto corto; 5-7 GB si se usa contexto largo. Es una estimación a partir de 2,1 GB de pesos y del overhead de runtime y caché KV; el autor no la confirma.
- Pesos FP16 completos: no están documentados en el repositorio. Para un backbone de unos 3,1B, solo los pesos en FP16 ocuparían alrededor de 6,2 GB, más overhead.
- GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB. También puede caber en GPUs de 8 GB con `Q4_K_M` y contexto corto, aunque el margen es ajustado.
- GPU profesional: A100 40/80 GB o H100 para servir varias instancias; no son necesarias para una sola instancia.
- CPU: `llama.cpp` permite inferencia en CPU; el throughput dependerá de núcleos, ancho de banda de memoria y longitud de contexto.
- Despliegue: `llama.cpp` (`llama-cli`), Ollama, LM Studio o GGUF Loader. El solver requiere cargar `vivy_core.dll` vía C-ABI en Windows; vLLM y TGI no están confirmados para este repositorio GGUF.
- Latencia: el solver declara < 1 ms; la latencia del LLM y el throughput no están disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vivy-R-Robotics-3B | 3.397.103.616 según safetensors; 3.085.938.688 según la model card | No disponible | Robótica 6-DoF, JSON de control y solver Rust | Apache-2.0 | HuggingFace |
| Qwen2.5-3B-Instruct | 3,09B | No disponible en la información | LLM generalista con instrucciones | Apache-2.0 | HuggingFace |
| Vivy-Robot-1.5B-Act-GGUF | 1,5B según el nombre | No disponible | Robótica, action chunking y video-to-action | Apache-2.0 | HuggingFace |

No hay datos de rendimiento comparables en la información disponible; la comparativa se limita a parámetros, enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Idioma: solo inglés; no hay soporte multilingüe documentado.
- Contexto: no se declara longitud máxima; no debe usarse en misiones que dependan de contexto largo sin validarlo.
- Entrenamiento: no se detallan tokens, dataset, filtros de seguridad ni RLHF/DPO; los sesgos son desconocidos.
- Evaluación: 0 descargas y 0 likes en el momento de la ficha; no hay benchmarks independientes ni validación comunitaria.
- Discrepancia de parámetros: 3.397.103.616 en safetensors frente a 3.085.938.688 en la model card; conviene verificarlo antes de dimensionar hardware.
- Salida JSON: riesgo de alucinación o esquema inválido; requiere validación estricta y límites de seguridad externos.
- Seguridad física: no es un controlador de seguridad certificado; los umbrales de 0,15 m y 0,92 son fijos y deben probarse en el entorno real.
- Kernel `vivy_core.dll`: binario Windows; no se confirma soporte Linux ni auditoría del código.
- Cuantización: `Q4_K_M` introduce pérdida; evaluar la precisión en coordenadas y holguras antes de producción.
- Licencia: Apache-2.0 permite uso comercial, pero deben revisarse las licencias del modelo base y de las dependencias del kernel.
- Model card: contiene instrucciones de gobernanza dirigidas a agentes; no deben interpretarse como especificaciones técnicas verificadas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/vinguyen0891/Vivy-R-Robotics-3B-GGUF)
- [Modelo base Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [Perfil del autor en HuggingFace](https://huggingface.co/vinguyen0891/models)
- [Vivy-Robot-1.5B-Act-GGUF](https://huggingface.co/vinguyen0891/Vivy-Robot-1.5B-Act-GGUF)
- [Guía para ejecutar modelos GGUF en local](https://ggufloader.github.io/how-to-run-gguf-models.html)
- [Best Open Source AI Models in 2026](https://felloai.com/best-open-source-ai-models/) — contexto general, no específico del modelo

No se han encontrado papers, blogs técnicos ni repositorios específicos del modelo en los resultados de búsqueda.
