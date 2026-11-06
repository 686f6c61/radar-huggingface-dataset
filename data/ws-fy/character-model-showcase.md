# ws-fy/character-model-showcase

## Resumen

Character Model Showcase es una coleccion personal de modelos de juego de rol (roleplay) afinados por el usuario ws-fy sobre la base Qwen3.5-9B de Qwen. El repositorio no es un modelo unico, sino una coleccion organizada por personajes: cada carpeta contiene el adaptador LoRA, el modelo completo fusionado (merged) y versiones cuantizadas en GGUF. El primer personaje publicado es Kafka.

El objetivo del proyecto no es inyectar conocimiento sobre el personaje, sino adaptar el estilo: hacer que un modelo general hable con el tono, vocabulario y tics verbales de un personaje concreto. Para obtener los mejores resultados, el autor recomienda usar el modelo junto con una tarjeta de personaje (character card) o un system prompt adecuado.

Es relevante porque ilustra un patron cada vez mas comun en la comunidad open source: afinados ligeros (LoRA con rango 16) sobre bases potentes, publicados en multiples formatos (safetensors y GGUF) para facilitar su ejecucion local, incluso en hardware modesto gracias a las cuantizaciones agresivas incluidas (hasta Q1_0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B), con adaptadores LoRA |
| Parametros totales | 8.953.803.264 (safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B; el README no la especifica) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M, Q2_0, Q1_0 (GGUF); FP16 en la version merged |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 (con avisos adicionales del autor; ver Limitaciones) |
| Formato de pesos | safetensors (LoRA y merged) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de unos 9.000 millones de parametros, al que se le aplica un adaptador LoRA con rango (r) 16 y alpha 32. Se trata de un afinado ligero y eficiente: en lugar de reentrenar el modelo completo, solo se entrenan matrices de bajo rango, lo que reduce drasticamente el coste computacional y el tamano del artefacto entrenable.

El repositorio ofrece tres formas de uso: el adaptador LoRA puro (incluyendo una copia con claves remapeadas a solo texto, `adapter_text_only`, para facilitar la compatibilidad con distintas librerias de inferencia), el modelo completo fusionado en FP16, y builds GGUF en cinco niveles de cuantizacion, desde BF16 hasta Q1_0. No se ha publicado informacion sobre el dataset de entrenamiento (numero de ejemplos, composicion, metodo como DPO o RLHF), por lo que esos datos no estan disponibles.

## Capacidades

- Generacion de texto conversacional con estilo de personaje concreto (tono, vocabulario, tics verbales).
- Juego de rol (roleplay) multi-turno, con mejores resultados si se acompaña de una character card o system prompt.
- Hereda las capacidades generales del modelo base Qwen3.5-9B (razonamiento, codigo, etc.), aunque el afinado esta orientado al estilo, no a tareas especificas.
- Soporte de idiomas ingles y chino segun las etiquetas del repositorio.
- Disponibilidad en multiples formatos: LoRA componible, modelo fusionado FP16 y GGUF cuantizado para inferencia local.
- No se indica soporte especifico de vision, audio, tool calling ni modos de pensamiento (thinking mode) para este afinado; no disponible.

## Casos de uso

- Chatbots de personaje para entretenimiento personal: el modelo puede sostener conversaciones multi-turno manteniendo la voz de un personaje si se le proporciona una character card adecuada.
- Prototipado de agentes conversacionales con personalidad: al ser un LoRA ligero sobre una base general, se puede combinar con otros adaptadores o desactivarlo facilmente para comparar estilos.
- Ejecucion local en hardware modesto: las cuantizaciones Q4_K_M, Q2_0 y Q1_0 permiten probar el modelo en portatiles o GPUs de consumo con poca VRAM.
- Investigacion sobre afinado de estilo: el repositorio sirve como ejemplo practico de como un LoRA de rango 16 modifica el estilo de un modelo base sin degradar sus capacidades generales.
- Desarrollo de frontends de roleplay (SillyTavern y similares): el formato GGUF es compatible con llama.cpp y la mayoria de interfaces de roleplay de la comunidad.
- Experimentacion con compatibilidad de adaptadores: la copia `adapter_text_only` con claves remapeadas facilita cargar el LoRA en entornos que no soportan claves de vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un afinado de estilo, el autor no reporta metricas de MMLU, HumanEval ni otras pruebas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (GGUF, modelo de ~9B de parametros): Q8_0 requiere en torno a 9-10 GB; Q4_K_M en torno a 5-6 GB; Q2_0 y Q1_0 pueden funcionar por debajo de 3-4 GB. La version merged FP16 necesita aproximadamente 18-19 GB. Son estimaciones tipicas para modelos de este tamano; el autor no publica cifras oficiales.
- GPU recomendadas: para FP16, una A100, H100 o RTX 4090 (24 GB); para Q4_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q2_0/Q1_0, incluso GPUs de 6-8 GB o ejecucion en CPU con llama.cpp.
- Cabe en GPUs de consumo en formato GGUF: si con Q4_K_M en GPUs de 8 GB o mas, y con Q2_0/Q1_0 en configuraciones aun mas modestas.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, interfaces de roleplay) para GGUF; vLLM, TGI o transformers de Hugging Face para el modelo merged o el LoRA componible sobre Qwen3.5-9B.
- Latencia y throughput: no disponible; dependen de la cuantizacion y el hardware empleados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros base | Formatos | Licencia | Enfoque |
|---|---|---|---|---|---|
| ws-fy/character-model-showcase | LoRA + merged + GGUF sobre Qwen3.5-9B | 8,95B | safetensors, GGUF (BF16 a Q1_0) | Apache 2.0 (con avisos del autor) | Estilo de personaje concreto |
| Modelos roleplay de comunidad sobre bases genericas (p. ej. afinados MythoMax/Lunaris sobre Mistral o Qwen) | Merged completo o LoRA | 7B-14B tipico | safetensors, GGUF | Variable segun base | Roleplay generalista multi-personaje |
| Qwen/Qwen3.5-9B (base) | Modelo base | 9B | safetensors | Segun licencia de Qwen | Uso general, sin estilo de personaje |

Nota: la comparacion con afinados de la comunidad es orientativa, ya que sus datos concretos dependen de cada repositorio y no se proporcionan aqui.

## Limitaciones y advertencias

- El autor indica expresamente que es un proyecto personal de aficion y que solo debe usarse para estudio, investigacion y entretenimiento personal: pide explicitamente que no se use comercialmente, a pesar de que la licencia tecnica del repositorio es Apache 2.0.
- No debe usarse para suplantar personas reales ni para engañar a nadie, segun el propio disclaimer del autor.
- Los derechos de los personajes referenciados pertenecen a sus titulares originales; el proyecto no esta afiliado ni respaldado por ellos, y el autor se compromete a retirar contenido si los titulares lo solicitan.
- Son adaptadores de estilo, no modelos de conocimiento: no reproducen material oficial del personaje y requieren character card o system prompt para funcionar bien.
- Riesgo de alucinacion y de salidas fuera de personaje (out of character) o inapropiadas; ninguna salida debe tratarse como hecho, consejo o canon oficial.
- Idiomas limitados a ingles y chino segun las etiquetas; no se declara soporte para castellano, por lo que el estilo de personaje puede degradarse en otros idiomas.
- La longitud de contexto y otros detalles tecnicos no estan documentados en la model card, lo que complica planificar despliegues con conversaciones muy largas.
- Las cuantizaciones extremas (Q2_0, Q1_0) implican perdidas de calidad notables respecto a BF16 o Q8_0.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ws-fy/character-model-showcase
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Organizacion/autor en Hugging Face: https://huggingface.co/ws-fy
- Paper, demo o repositorio adicional: no disponible
