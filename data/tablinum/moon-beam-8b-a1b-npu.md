# tablinum/Moon-Beam-8B-A1B-NPU

## Resumen

Moon-Beam-8B-A1B-NPU es la distribucion cuantizada en GGUF del modelo Moon-Beam-8B-A1B, preparada especificamente para ejecutarse sobre la NPU Qualcomm Hexagon (arquitectura HTP v73 o superior) en dispositivos Windows on Snapdragon. El modelo base, desarrollado por tablinum, es un mixture-of-experts (MoE) de 8B parametros totales y aproximadamente 1B activos por token, construido a partir de inclusionAI Ling-3.0-tiny y ampliado con la libreria de conocimiento recuperable *engram* del autor. Esta variante concreta anade el puente de ejecucion GGML-Hexagon que permite lanzar el modelo sobre la NPU integrada en plataformas Snapdragon X.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un MoE con atencion lineal y MLA sobre una NPU de consumo (45 TOPS en el Snapdragon X1-26-100), sin necesidad de activar el modo TESTSIGNING de Windows, gracias a los binarios HTP firmados por Microsoft que distribuye Qualcomm GenieX. Frente a la ejecucion en CPU, la NPU reduce la utilizacion del procesador anfitrion de un 99,6% a aproximadamente un 21%, manteniendo velocidades de decodificacion de unos 26,5 tok/s y un prefill que iguala al de la CPU en prompts largos.

El modelo conserva la ventana de contexto de 131.072 tokens del modelo base, soporta modo thinking y tool calling, y se distribuye bajo licencia MIT. El repositorio ocupa 4,7 GB e incluye un unico fichero Q4_0 de 4,71 GB. No se han publicado resultados de benchmarks especificos de esta build NPU mas alla de las mediciones de rendimiento incluidas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) basada en inclusionAI Ling-3.0-tiny, con atencion lineal y MLA (multi-head latent attention); tipo `bailingmoe3` en GGML |
| Parametros totales | 7.893.392.800 (8B) |
| Parametros activos | Aproximadamente 1B por token (A1B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q4_0 (fichero distribuido, 4,71 GB); derivado de Q8_0 con `--output-tensor-type Q8_0 --token-embedding-type Q8_0`; kernels nativos `q4_0_tiled` y `q8_0_tiled` HVX |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (`Moon-Beam-8B-A1B-Q4_0.gguf`, 4.705.469.280 bytes; SHA256 `03aad3b410d47a157f4f780f3db6b9a113850cfeb0a2a56275fe3da7a1fcbe2e`) |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso de tipo mixture-of-experts con 8B parametros totales y aproximadamente 1B activos por token, derivado de inclusionAI Ling-3.0-tiny. Incorpora atencion lineal y multi-head latent attention (MLA), lo que reduce el coste de memoria del KV cache frente a atencion completa y resulta clave para sostener ventanas de 131.072 tokens. La capa de conocimiento *engram* consiste en una libreria de pasajes recuperables sobre la que el modelo fue entrenado para responder; la model card indica que Moon-beam esta disenado para contestar a partir de pasajes recuperados que se le inyectan en el prompt, no solo desde sus pesos.

El ajuste se realizo con QLoRA sobre pasajes recuperados, problemas matematicos, llamadas a herramientas y conversaciones multi-turno. La model card menciona dos rondas de entrenamiento: la ronda 1b es la que se publica, porque la ronda 2 no supero las puertas de evaluacion sobre el conjunto de validacion (documentado en `round2_gate_decision.txt`). No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. La build NPU no modifica los pesos semanticamente: aplica una cuantizacion limpia Q8_0 -> Q4_0 que, segun el autor, mantiene un 99,18% de concordancia mixta con BF16.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de plantillas de chat.
- Razonamiento matematico con modo thinking activado (95,5% en 400 preguntas de GSM8K segun la model card).
- Modo thinking activable y desactivable por peticion mediante `chat_template_kwargs: {enable_thinking: false}` o el flag `--think=false` del servidor.
- Tool calling y function calling, con entrenamiento explicito en llamadas a herramientas.
- Comportamiento como agente de soporte multi-turno, evaluado en tau2-bench en dominios de aerolinea, retail y telecom.
- Respuesta aumentada por recuperacion (RAG) sobre la libreria *engram*: el modelo esta entrenado para responder a partir de pasajes inyectados.
- Memoria persistente de conversacion mediante el proxy `terrabeam` situado delante del servidor GenieX.
- Ejecucion sobre NPU Qualcomm Hexagon HTP v73+ con kernels HVX nativos, ademas de ejecucion estandar en CPU via `llama-server`.
- Servidor compatible con la API de OpenAI en `http://127.0.0.1:18181/v1`.

## Casos de uso

- Asistente local en portatiles Snapdragon X: el modelo se ejecuta sobre la NPU Hexagon con `geniex serve -c npu`, liberando la CPU (uso del 21% frente al 99,6% en CPU) para que el resto del sistema siga siendo utilizable durante la inferencia.
- Agente de soporte al cliente multi-turno: el modelo fue evaluado en tau2-bench como agente de aerolinea, retail y telecom, por lo que encaja en flujos de atencion con historial largo y llamadas a herramientas de backoffice.
- RAG sobre documentacion interna: combinado con `terrabeam`, cada peticion recibe pasajes relevantes de la libreria *engram* y memoria de conversacion, lo que permite construir un asistente de conocimiento corporativo sin reentrenar.
- Resolucion de problemas matematicos paso a paso: con thinking activado y hasta 32K tokens nuevos, el modelo alcanza el 95,5% en GSM8K, adecuado para tutoria o verificacion de calculos en pipelines internos.
- Automatizacion de tareas con tool calling en entornos de escritorio: al exponer una API compatible con OpenAI en localhost, se puede integrar en scripts y agentes que invoquen funciones del sistema sin salir del dispositivo.
- Desarrollo y prueba de aplicaciones de IA en hardware ARM: sirve como banco de pruebas para validar kernels GGML-Hexagon, cuantizaciones Q4_0/Q8_0 y el puente Unsloth-Qualcomm antes de desplegar en produccion.
- Prototipado de asistentes con contexto largo: la ventana de 131K tokens permite cargar contratos, manuales o transcripciones extensas en una sola sesion, aunque en la configuracion NPU medida se uso `nctx 4096`, por lo que el contexto efectivo dependera de la memoria disponible.

## Benchmarks y rendimiento

Resultados del modelo base reportados en la model card (protocolo de evaluacion de la model card, temperatura 1,0, top_p 0,95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K):

| Benchmark | Metrica | Resultado |
|---|---|---|
| GSM8K (400 preguntas) | Precision con thinking | 95,5% |
| EngramBench | Aciertos con thinking y pasajes de la propia tabla | 436/503 (86,5%) |
| tau2-bench airline | Recompensa media | 0,71 |
| tau2-bench retail | Recompensa media | 0,80 |
| tau2-bench telecom | Recompensa media | 0,62 |

Rendimiento de la build NPU en Snapdragon X1-26-100 (45 TOPS Hexagon NPU, 16 GB LPDDR5x, Windows 11 ARM64 Build 26300, contexto 4096, `max_tokens=64`, temperatura 0,0, thinking off, media de 2 ejecuciones sin cache):

| Prompt | Prefill CPU (tok/s) | Prefill NPU (tok/s) | Decode CPU (tok/s) | Decode NPU (tok/s) | TTFT CPU (ms) | TTFT NPU (ms) | CPU anfitrion CPU | CPU anfitrion NPU |
|---|---|---|---|---|---|---|---|---|
| Corto (~135 tok) | 255,7 | 199,7 | 46,6 | 27,0 | 592 | 696 | 98,9% | 21,5% |
| Medio (~644 tok) | 360,1 | 321,2 | 42,4 | 26,6 | 1.778 | 2.002 | 99,6% | 21,5% |
| Largo (~1.796 tok) | 332,4 | 335,3 | 36,1 | 26,5 | 5.402 | 5.353 | 99,6% | 21,1% |

No se han publicado resultados de benchmarks de esta build NPU sobre MMLU, HumanEval ni otros conjuntos estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el fichero Q4_0 ocupa 4,71 GB; se necesita al menos esa cantidad de memoria unificada disponible, mas el espacio de trabajo del contexto. La prueba de referencia se realizo en un equipo con 16 GB LPDDR5x.
- NPU: Qualcomm Hexagon HTP v73 o superior (Snapdragon X y posteriores). Se requieren los binarios firmados por Microsoft `ggml-hexagon.dll`, `libggml-htp-v73.so` y `libggml-htp.cat` que distribuye Qualcomm GenieX; no hace falta activar TESTSIGNING.
- CPU: ejecutable en cualquier CPU x86-64 o ARM64 mediante `llama-server`, con velocidades de decodificacion superiores a la NPU en la prueba realizada (46,6 frente a 27,0 tok/s en prompts cortos) pero con la CPU al 99% de utilizacion.
- GPU: no se documenta soporte GPU especifico para esta build; el foco es NPU Hexagon y CPU.
- Despliegue: Qualcomm GenieX CLI (`geniex pull` / `geniex serve`) para NPU; `llama-server` para CPU; proxy `terrabeam` para RAG y memoria persistente; el puente Unsloth-Qualcomm permite generar builds equivalentes para otros modelos.
- Modos de energia GenieX: `power_saver`, `balanced`, `high_performance`, `sustained_high_performance`, `burst`.
- Latencia y throughput: los de la tabla anterior; el prefill en NPU iguala al de la CPU a partir de ~1.800 tokens de prompt (335,3 frente a 332,4 tok/s) y el TTFT es practicamente identico (5.353 frente a 5.402 ms).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B-NPU | 8B totales, ~1B activos | 131.072 | MIT | MoE + engram, build NPU Hexagon | Hugging Face (GGUF) |
| Moon-Beam-8B-A1B-GGUF | 8B totales, ~1B activos | 131.072 | MIT | MoE + engram, build GGUF general | Hugging Face |
| Qwen3-0.6B (Q4_0) | 0,6B densos | no disponible | no disponible | Denso, referencia del puente NPU | Hugging Face |
| inclusionAI Ling-3.0-tiny | no disponible | no disponible | no disponible | MoE base del que deriva Moon-Beam | Hugging Face |

La informacion disponible no incluye comparativas cuantitativas frente a otros MoE de tamano similar ni frente a modelos densos de 7-8B. El unico punto de comparacion medido es Qwen3-0.6B-Q4_0 sobre el mismo puente NPU, donde el autor reporta hasta 2.402 tok/s de prefill (2,62x mas rapido a ~1.780 tok) y un TTFT 2,66x menor; no es un competidor directo por tamano.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta cobertura multilingue.
- El modelo esta entrenado para responder a partir de pasajes recuperados; sin el contexto adecuado (por ejemplo, sin `terrabeam` o sin inyectar pasajes), el rendimiento en tareas de conocimiento puede degradarse.
- Riesgo de alucinacion inherente a modelos generativos; la model card no documenta tasas de alucinacion ni evaluaciones de factualidad fuera de EngramBench.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La build NPU esta atada a hardware Qualcomm Hexagon HTP v73+ y a Windows 11 ARM64; no funciona en NPU AMD XDNA 2 (que usa `.q4nx` propietario y no soporta `bailingmoe3`).
- La configuracion medida en NPU usa un contexto de 4096 tokens, muy por debajo de los 131.072 soportados; el contexto efectivo dependera de la memoria disponible en el dispositivo.
- La decodificacion en NPU es mas lenta que en CPU en la prueba realizada (26,5-27,0 frente a 36,1-46,6 tok/s); la ventaja esta en el uso de CPU y en el prefill de prompts largos.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias (GenieX, binarios HTP) antes de desplegar en produccion.
- La ronda 2 de entrenamiento no supero las puertas de validacion, por lo que el modelo publicado es la ronda 1b; puede haber margen de mejora no incluido en esta release.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica una validacion comunitaria practicamente inexistente.

## Enlaces

- Hugging Face (build NPU): https://huggingface.co/tablinum/Moon-Beam-8B-A1B-NPU
- Hugging Face (modelo base): https://huggingface.co/tablinum/Moon-Beam-8B-A1B
- Hugging Face (build GGUF Q8_0): https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF
- Notas de modelo y evaluacion: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md
- Decision de la ronda 2: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt
- Puente Unsloth-Qualcomm NPU: https://github.com/chadstthomas-svg/unsloth-qualcomm-npu-bridge
- PR upstream de Unsloth: https://github.com/unslothai/unsloth/pull/19316
- Proxy terrabeam (RAG y memoria): https://github.com/chadstthomas-svg/terrabeam
