# stratosphere/qwen3.5-0.8b-slips-immune-summarization

## Resumen

Qwen3.5-0.8B Slips Immune Summarization es un ajuste fino supervisado (SFT) del modelo base Qwen3.5-0.8B de Alibaba, desarrollado por el grupo Stratosphere (Stratosphereips). Su proposito es traducir los eventos tecnicos de red que genera el sistema de deteccion de intrusiones Slips (StratosphereLinuxIPS) en resumenes legibles para humanos, agrupados por tipo de evento y con etiquetas de severidad (CRITICAL, HIGH, MEDIUM, LOW, INFO).

El modelo resuelve un problema concreto de operacion en ciberseguridad: los logs de Slips se estructuran como DAG (grafos aciclicos dirigidos) de alertas por IP origen y ventana temporal, y son dificiles de interpretar rapidamente por un analista. Este ajuste convierte esos DAG en resumenes concisos con desglose de severidad. Es la version para dispositivos pequenos del modelo `qwen2.5-1.5b-slips-immune-summarization`: mismo dataset de entrenamiento, mismo prompt e hiperparametros, pero con aproximadamente la mitad de parametros.

Con 873 millones de parametros totales (unos 0,75B en el modelo de lenguaje, ya que conserva el codificador visual sin entrenar del base) y licencia Apache 2.0, esta pensado para despliegue en hardware de borde, incluyendo una Raspberry Pi 5, donde genera un resumen de incidente en aproximadamente un minuto segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), con codificador visual del base sin entrenar |
| Parametros totales | 873.438.784 (~0,87B); ~0,75B en el modelo de lenguaje |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. El checkpoint conserva el codificador visual del modelo base (no entrenado) para que cargue como un checkpoint Qwen3.5 estandar; al usar `AutoModelForCausalLM` solo se carga el modelo de lenguaje de ~0,75B parametros. Los archivos GGUF contienen unicamente el modelo de lenguaje.

El entrenamiento consistio en SFT (Supervised Fine-Tuning) con seleccion best-of-N de respuestas: para cada incidente de entrenamiento se generaron candidatos con GPT-4o, GPT-4o-mini, Qwen2.5 3B y Qwen2.5 1.5B, y se eligio como referencia la respuesta mejor puntuada por un juez LLM. El dataset utilizado es `stratosphere/immune-summary-sft-dataset`. Se emplearon las librerias TRL y Unsloth, con adaptadores LoRA. La model card indica que se usaron los mismos datos, prompt e hiperparametros que en la version de 1.5B.

## Capacidades

- Generacion de resumenes de incidentes de seguridad de red a partir de logs DAG de Slips.
- Agrupacion de eventos identicos o muy similares en una sola linea de resumen.
- Asignacion de severidad por evento o grupo (CRITICAL, HIGH, MEDIUM, LOW, INFO) y calculo del desglose global de severidad.
- Transformacion de descripciones tecnicas en lenguaje natural legible.
- Generacion de texto conversacional en ingles.
- Soporte de plantilla de chat con system prompt por defecto de Qwen.
- Despliegue en CPU y dispositivos de borde mediante GGUF y llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision funcional ni audio en la informacion disponible.

## Casos de uso

- Triaje de alertas en un SOC: el modelo recibe el DAG de un incidente de Slips y devuelve un resumen agrupado con severidades, lo que permite al analista priorizar sin leer el log crudo.
- Monitorizacion en dispositivos de borde: con el GGUF Q4_K_M (529 MB) puede ejecutarse en una Raspberry Pi 5 con llama.cpp, generando un resumen por incidente en aproximadamente un minuto, util para despliegues remotos sin GPU.
- Enriquecimiento de pipelines de SIEM: integrado como paso previo al envio de alertas a un SIEM o sistema de tickets, convierte eventos tecnicos en texto estructurado y etiquetado por severidad.
- Generacion de informes de turno: a partir de multiples DAG de una ventana temporal, produce resumenes consistentes con formato fijo (metadatos, lineas de evidencia, desglose de severidad) para documentacion operativa.
- Filtrado y reduccion de ruido: la agrupacion de eventos repetidos (por ejemplo, 24 conexiones identicas en una linea) reduce el volumen de alertas que llega al analista humano.
- Despliegue air-gapped: al ser un modelo pequeno con licencia Apache 2.0 y pesos GGUF, puede ejecutarse en entornos sin conexion a internet dentro de infraestructura de seguridad critica.
- Prototipado y evaluacion de flujos de resumen de IDS: sirve como referencia ligera para comparar con el modelo de 1.5B de la misma familia antes de escalar a produccion.

## Benchmarks y rendimiento

La model card indica que, bajo la misma evaluacion LLM-as-judge, este modelo de 0.8B obtiene una puntuacion equiparable a la del modelo de 1.5B de la misma familia. No se proporcionan cifras numericas de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Comparacion | Resultado |
|---|---|
| Frente a qwen2.5-1.5b-slips-immune-summarization | Puntuacion equiparable con LLM-as-judge (sin cifras publicadas) |
| Rendimiento en Raspberry Pi 5 | Aproximadamente 1 minuto por resumen de incidente |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | No disponibles |

## Requisitos de hardware

- VRAM estimada en BF16: alrededor de 1,8 GB para los pesos (~0,87B parametros a 2 bytes), mas overhead de activaciones y cache KV.
- GGUF Q4_K_M: 529 MB en disco; recomendado para Raspberry Pi y otras CPU.
- GGUF Q5_K_M: 578 MB en disco.
- GGUF Q8_0: 812 MB en disco; evita un bucle de repeticion raro observado con Q4/Q5.
- GPU: no se especifican GPU recomendadas; el modelo cabe holgadamente en cualquier GPU consumer (por ejemplo, RTX 3060 en adelante) e incluso en CPU.
- Dispositivos de borde: validado en Raspberry Pi 5 con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`) y Transformers (requiere version reciente con soporte Qwen3.5, probado con 5.17).
- Nota de rendimiento en CPU: en Raspberry Pi 5 debe desactivarse flash attention (`-fa off`), ya que con `-fa auto` ralentiza la generacion con prompts largos.
- Latencia: aproximadamente 1 minuto por resumen de incidente en Raspberry Pi 5; no se documentan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-0.8b-slips-immune-summarization | ~0,87B | no disponible | Apache 2.0 | Resumen de incidentes Slips, borde | HF, GGUF |
| qwen2.5-1.5b-slips-immune-summarization | ~1,5B | no disponible | no disponible | Resumen de incidentes Slips | HF |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | Modelo generalista | HF |

La comparativa detallada con alternativas de la misma categoria (modelos especializados en resumen de alertas de IDS) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en ingles; no se documenta soporte multilingue.
- Especializado en el formato de logs de Slips; su rendimiento fuera de ese esquema de entrada no esta validado.
- Riesgo de bucle de repeticion con las cuantizaciones Q4_K_M y Q5_K_M; la model card recomienda Q8_0 para evitarlo.
- En CPU sin GPU, la generacion es lenta (aproximadamente un minuto por resumen en Raspberry Pi 5).
- El codificador visual del checkpoint no esta entrenado; no debe asumirse capacidad de vision funcional.
- Las severidades asignadas son generadas por el modelo y no deben tratarse como veredictos definitivos sin revision humana.
- No se documentan sesgos especificos ni evaluaciones de robustez frente a entradas malformadas o adversariales.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantias de exactitud en contextos de seguridad critica.
- La model card no detalla la longitud de contexto soportada; el ejemplo de despliegue usa 8192 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stratosphere/qwen3.5-0.8b-slips-immune-summarization
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Version de 1.5B de la misma familia: https://huggingface.co/stratosphere/qwen2.5-1.5b-slips-immune-summarization
- Repositorio de Slips (StratosphereLinuxIPS): https://github.com/stratosphereips/StratosphereLinuxIPS
- Dataset de entrenamiento: stratosphere/immune-summary-sft-dataset (referenciado en la model card)
