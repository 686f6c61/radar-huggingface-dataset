# themohal/saraiki-qwen-8b-tool-use

## Resumen

El modelo `themohal/saraiki-qwen-8b-tool-use` es un adaptador LoRA desarrollado por themohal que convierte el modelo base Qwen3-8B-Base en un asistente conversacional con capacidad de llamada a herramientas (tool-use / function-calling) para el idioma **Jataki Saraiki** (سرائیکی), una lengua indoaria hablada en Pakistán. Este adaptador constituye la **etapa 3** de un pipeline de tres fases: primero un entrenamiento continuado (CPT) en texto saraiki, después un ajuste por instrucciones (SFT) y finalmente el ajuste específico para uso de herramientas.

El modelo responde a instrucciones y preguntas en saraiki de forma conversacional, y además puede invocar funciones o herramientas externas, lo que lo hace adecuado para integrarse en agentes o asistentes que necesiten interactuar con APIs u otros servicios. Su relevancia radica en que el saraiki jataki prácticamente no cuenta con herramientas LLM existentes, y este modelo cubre ese nicho con una arquitectura ligera (8B) y licencia Apache-2.0.

Al estar basado en Qwen3-8B, hereda su arquitectura transformer densa y su ventana de contexto de hasta 131 072 tokens (con YaRN), aunque el entrenamiento del adaptador se realizó con una longitud máxima de secuencia de 2048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B-Base) con adaptador LoRA |
| Parametros totales | 8 030 000 000 (modelo base) + adaptador LoRA (~16M estimados) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens (modelo base, con YaRN); entrenado con max_seq_length 2048 |
| Tipos de cuantizacion | no especificados; el ejemplo de uso emplea load_in_4bit (bitsandbytes) |
| Idiomas soportados | Saraiki (jataki) principalmente; el base Qwen3-8B soporta multiples idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo base) + adaptador PEFT (LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-8B-Base, un transformer denso de 8B parámetros. El entrenamiento sigue un pipeline de tres etapas:

1. **Stage 1 (CPT)**: continuacion del pretraining sobre texto saraiki (`themohal/saraiki-qwen3-8b-cpt`).
2. **Stage 2 (SFT)**: ajuste por instrucciones sobre el modelo CPT, con un adaptador LoRA (r=16, alpha=32, dropout=0.0) entrenado con `assistant_only_loss=True` y un dataset de pares pregunta-respuesta en saraiki generado y validado con Gemini.
3. **Stage 3 (tool-use)**: el adaptador actual, entrenado sobre el modelo SFT con el dataset `themohal/saraiki-tool-use-sft`, que añade la capacidad de llamar funciones/herramientas.

El tokenizer se extendio con dos caracteres especificos del arabe-saraiki (ڻ y ݙ) como tokens dedicados. El entrenamiento se realizo con TRL `SFTTrainer` y una longitud maxima de secuencia de 2048 tokens. No se especifican los hiperparametros exactos del Stage 3 (r, alpha, dropout, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en saraiki jataki: responde a preguntas, sigue instrucciones y mantiene dialogos multi-turno.
- **Tool-use / function calling**: puede invocar funciones externas definidas por el usuario, lo que permite integrarlo en agentes que necesiten consultar APIs, bases de datos o ejecutar acciones.
- Soporte de chat mediante plantilla de mensajes de Qwen3 (roles user/assistant).
- Capacidad de desactivar el modo de pensamiento (`enable_thinking=False`) para respuestas directas sin razonamiento previo.
- Multilingue limitado: aunque el base es multilingue, el adaptador esta especializado en saraiki; el uso en otros idiomas puede degradar el rendimiento.
- No se menciona soporte de vision, audio ni otras modalidades.

## Casos de uso

- **Atencion al cliente en saraiki**: un asistente que gestione consultas de usuarios en saraiki, con capacidad de llamar a una API de pedidos o CRM para consultar estados, resolver incidencias o actualizar datos.
- **Agente de reservas local**: integrado en un sistema de reservas de restaurantes o hoteles, donde el modelo interpreta la peticion en saraiki y llama a funciones de disponibilidad o confirmacion.
- **Asistente de informacion gubernamental**: responde preguntas sobre tramites o servicios publicos en saraiki, invocando una funcion de busqueda en una base de datos oficial.
- **Herramienta de traduccion y transcripcion**: dado que el saraiki tiene poca cobertura digital, el modelo puede servir como interfaz conversacional para transcribir o traducir consultas habladas (via ASR) a texto estructurado.
- **Chatbot educativo**: responde preguntas de estudiantes en saraiki sobre matematicas o ciencias, y puede llamar a una funcion de calculadora o a un motor de busqueda de recursos.
- **Automatizacion de tareas de back-office**: en entornos donde el personal habla saraiki, el modelo puede interpretar comandos de voz o texto y ejecutar funciones de generacion de informes, envio de correos o actualizacion de hojas de calculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo no esta disenado para competir con modelos frontier en razonamiento general, sino para cubrir el nicho del saraiki jataki.

## Requisitos de hardware

- **VRAM estimada**: con cuantizacion de 4 bits, el modelo base de 8B requiere aproximadamente 5-6 GB de VRAM para inferencia; con 8 bits, alrededor de 9-10 GB; en precision completa, unos 16 GB.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 3070, etc.) para cuantizacion 4-bit; para mayor velocidad, RTX 3090 o RTX 4090.
- **Compatibilidad con GPU de consumo**: si, cabe en GPUs consumer de gama media-alta con cuantizacion.
- **Opciones de despliegue**: el ejemplo de uso emplea `unsloth` y `peft` con `transformers`; tambien puede usarse con vLLM, llama.cpp u Ollama si se exporta el adaptador fusionado a GGUF.
- **Latencia y throughput**: no disponibles; dependen de la GPU y la cuantizacion. En una RTX 4090 con 4-bit, se esperan decenas de tokens por segundo para un modelo de 8B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tool-use |
|---|---|---|---|---|---|
| themohal/saraiki-qwen-8b-tool-use | 8B (base) | 131k (base) | Saraiki | Apache-2.0 | Si |
| Qwen3-8B-Base | 8B | 131k | Multilingue | Apache-2.0 | No (requiere fine-tuning) |
| Llama-3.1-8B | 8B | 128k | Multilingue (no saraiki) | Llama 3.1 Community License | Si (con fine-tuning) |
| Gemma-2-9B | 9B | 8k | Multilingue (no saraiki) | Gemma License | No |

No hay modelos comparables especificos para saraiki jataki; este es el unico adaptador conocido con tool-use para ese idioma.

## Limitaciones y advertencias

- **Alcance limitado**: el modelo esta entrenado principalmente para saraiki; su rendimiento en otros idiomas es impredecible.
- **Dependencia del pipeline**: el adaptador tool-use requiere cargar primero el adaptador CPT y el SFT (como se muestra en el ejemplo de uso), lo que complica el despliegue.
- **Calidad de los datos**: el dataset de entrenamiento se genera con Gemini, lo que puede introducir sesgos o errores propios del modelo generador.
- **Entrenamiento continuo**: el dataset crece diariamente, por lo que el adaptador se actualiza con frecuencia; cada version puede comportarse de forma ligeramente distinta.
- **Sin modo de pensamiento**: el modelo fue entrenado con `enable_thinking=False`; usarlo con thinking mode activado producira bloques vacios de razonamiento.
- **Riesgo de alucinacion**: al ser un modelo de 8B con fine-tuning en un idioma de bajos recursos, puede alucinar hechos o inventar respuestas, especialmente en dominios especializados.
- **Sin garantias de seguridad**: no se mencionan evaluaciones de sesgo o seguridad; se recomienda validar el comportamiento antes de usarlo en produccion con usuarios reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/themohal/saraiki-qwen-8b-tool-use
- Modelo SFT (Stage 2): https://huggingface.co/themohal/saraiki-qwen-8b-sft
- Modelo CPT (Stage 1): https://huggingface.co/themohal/saraiki-qwen3-8b-cpt
- Dataset de tool-use: https://huggingface.co/datasets/themohal/saraiki-tool-use-sft
- Dataset de asistente SFT: https://huggingface.co/datasets/themohal/saraiki-assistant-sft
- Modelo base Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio Qwen3: https://github.com/QwenLM/Qwen3
