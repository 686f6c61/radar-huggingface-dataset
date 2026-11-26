# stube123890/MindReader-7B-v1

## Resumen

MindReader-7B-v1 es un adaptador LoRA de interpretabilidad mecanistica desarrollado por el usuario stube123890. Se construye sobre Qwen/Qwen2.5-Coder-7B-Instruct mediante un ajuste fino QLoRA y su funcion es actuar como "descompilador" de circuitos neuronales: recibe metadatos de arquitectura de un circuito y una firma de activaciones de comportamiento, y devuelve una funcion Python ejecutable `circuit_logic(tokens: list[str]) -> dict` que reproduce el algoritmo del circuito.

El modelo aborda un problema concreto de la investigacion en interpretabilidad: traducir hallazgos de circuitos (descubiertos con tecnicas como TransformerLens) a codigo verificable y ejecutable. Frente a la inspeccion manual, automatiza la identificacion de reglas y permite validar el comportamiento del circuito de forma empirica. Se entrena sobre 964 ejemplos ChatML derivados de 291 circuitos verificados causalmente, extraidos de 16 modelos de pesos abiertos.

Es relevante por su enfoque poco comun: no es un asistente generalista, sino una herramienta especializada para flujos de trabajo de interpretabilidad mecanistica. Su evaluacion ciega sobre circuitos no vistos (Gemma-2-2B y Llama-3.2-1B) reporta 100% de ejecucion correcta del codigo generado y 53% de identificacion de reglas, frente a un 0% de la linea base. El repositorio publica solo el adaptador (0,2 GB), no los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) con adaptador LoRA |
| Parametros totales | 7B en el modelo base; adaptador LoRA r=16 sobre todas las proyecciones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Entrenamiento en 4-bit nf4 (QLoRA); el adaptador se publica en safetensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT: `adapter_model.safetensors`) + tokenizer y config |

## Arquitectura y entrenamiento

El modelo es un ajuste fino QLoRA sobre Qwen/Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7B parametros orientado a codigo. El adaptador usa LoRA con r=16, alpha=32, dropout 0,05 y se aplica a todos los modulos de proyeccion, manteniendo el modelo base cuantizado en 4-bit nf4 durante el entrenamiento.

El dataset de entrenamiento consta de 964 ejemplos en formato ChatML construidos a partir de 291 circuitos verificados causalmente, extraidos de 16 modelos de pesos abiertos. El entrenamiento se ejecuto durante 3 epocas con learning rate 1e-4, scheduler coseno y perdida calculada solo sobre la completion (completion-only loss), alcanzando una perdida final de 0,037. La innovacion tecnica principal es la tarea en si: convertir metadatos de circuitos y firmas de activacion en funciones Python ejecutables, un puente entre la interpretabilidad mecanistica y la verificacion empirica del comportamiento.

## Capacidades

- Descompilacion de circuitos neuronales: genera funciones Python `circuit_logic(tokens: list[str]) -> dict` a partir de metadatos de arquitectura y firmas de activacion.
- Generacion de codigo ejecutable y autonomo que reproduce el algoritmo del circuito.
- Identificacion de reglas de comportamiento a partir de firmas de activacion.
- Validacion de fidelidad de comportamiento mediante ejecucion del codigo generado.
- Integracion con flujos de interpretabilidad mecanistica basados en TransformerLens.
- Generacion de texto conversacional (heredada del modelo base, formato ChatML).
- Capacidades de codigo del modelo base Qwen2.5-Coder-7B-Instruct (no evaluadas especificamente en esta ficha).
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Descompilacion automatizada de circuitos: dado un circuito descubierto con TransformerLens, el modelo genera una funcion Python que reproduce su algoritmo, lo que permite pasar de la inspeccion manual a la verificacion ejecutable.
- Validacion de hipotesis de interpretabilidad: el investigador compara la salida de `circuit_logic` con el comportamiento real del circuito para confirmar o refutar la regla identificada.
- Documentacion reproducible de circuitos: generar codigo ejecutable como artefacto documental de cada circuito, facilitando la revision por pares y la replicacion.
- Cribado de circuitos a escala: procesar lotes de circuitos minados de multiples modelos y filtrar automaticamente los que producen codigo ejecutable y fiel.
- Educacion e investigacion en interpretabilidad: usar el modelo como herramienta didactica para mostrar como se traduce un circuito en un algoritmo explicito.
- Integracion en pipelines de descubrimiento de circuitos: encadenar el minado de circuitos con la descompilacion automatica y la validacion de fidelidad como pasos de un pipeline de CI.
- Analisis comparativo entre modelos: descompilar circuitos equivalentes de distintos modelos de pesos abiertos y comparar las reglas identificadas.

## Benchmarks y rendimiento

Evaluacion ciega sobre 15 circuitos retenidos de google/gemma-2-2b y meta-llama/Llama-3.2-1B (nunca vistos en entrenamiento):

| Metrica | MindReader-7B-v1 | Linea base |
|---|---|---|
| Ejecucion correcta del codigo generado | 100% | no disponible |
| Identificacion de reglas | 53% | 0% |
| Fidelidad de comportamiento (pass) | 53% | 20% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA (0,2 GB) se carga sobre Qwen2.5-Coder-7B-Instruct; en 4-bit nf4 el modelo base ocupa aproximadamente 4-5 GB, en 8-bit unos 8 GB y en fp16 unos 14-15 GB (estimaciones derivadas del tamano del modelo base, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para fp16 con contexto largo; RTX 4090 (24 GB) para fp16; RTX 3090 o RTX 4080 para cuantizacion 8-bit.
- Cabe en GPU de consumo: si, en 4-bit o 8-bit en GPUs con 8-16 GB de VRAM; en fp16 requiere al menos 16 GB.
- Opciones de despliegue: PEFT sobre el modelo base con Transformers; vLLM o TGI para servir el modelo base fusionado con el adaptador; llama.cpp u Ollama si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la tarea de descompilacion de circuitos. Como referencia, se compara con el modelo base y con modelos de codigo de tamano similar:

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MindReader-7B-v1 | 7B (base) + LoRA | no disponible | Descompilacion de circuitos | MIT | Adaptador en HF |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible | Generacion de codigo e instrucciones | no disponible en esta ficha | Pesos completos en HF |
| Gemma-2-2B | 2B | no disponible | Generacion de texto | no disponible en esta ficha | Pesos completos en HF |
| Llama-3.2-1B | 1B | no disponible | Generacion de texto | no disponible en esta ficha | Pesos completos en HF |

Los dos ultimos se incluyen porque son las fuentes de los circuitos de evaluacion ciega, no como alternativas funcionales.

## Limitaciones y advertencias

- Limitacion documentada por el autor: las firmas de induccion y de first-token-sink sobre tokenizadores no vistos se descompilan sistematicamente como programas de token anterior (previous-token).
- La identificacion de reglas se limita al 53% en circuitos no vistos, por lo que aproximadamente la mitad de las descompilaciones no capturan la regla correcta, aunque el codigo se ejecute.
- El modelo esta especializado en una tarea muy concreta; no debe usarse como asistente generalista ni como generador de codigo de proposito general.
- Riesgo de alucinacion: puede generar codigo ejecutable que no corresponde al comportamiento real del circuito; la validacion de fidelidad es imprescindible en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de idioma: no disponibles; el entrenamiento se realizo sobre ejemplos ChatML en ingles presumiblemente (no confirmado).
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-Coder-7B-Instruct tiene su propia licencia que debe respetarse al redistribuir.
- El repositorio solo contiene el adaptador; es necesario descargar el modelo base para su uso.
- Sin descargas ni likes en el momento de la ficha; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stube123890/MindReader-7B-v1
- Codigo y proyecto: https://github.com/stube123890-hue/MindReader
- Dataset: https://huggingface.co/datasets/stube123890/MindReader-10k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
