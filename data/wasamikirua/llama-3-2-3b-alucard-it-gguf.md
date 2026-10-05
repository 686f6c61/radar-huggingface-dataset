# WasamiKirua/Llama-3.2-3B-Alucard-IT-GGUF

## Resumen

Llama-3.2-3B-Alucard-IT es un ajuste fino del modelo Llama-3.2-3B-Instruct de Meta, publicado por el usuario WasamiKirua en HuggingFace. Se trata de un modelo conversacional de 3.212.749.888 parametros (aproximadamente 3,2 mil millones) especializado en interpretar el personaje Alucard, el vampiro de la franquicia Hellsing, y en responder en italiano. El repositorio analizado contiene exclusivamente las versiones cuantizadas en formato GGUF del modelo, mientras que los pesos completos en safetensors residen en el repositorio hermano `WasamiKirua/Llama-3.2-3B-Alucard-IT`.

La relevancia de esta publicacion es doble. Por un lado, demuestra un flujo de trabajo de destilacion de estilo a bajo coste: un modelo profesor local (`qwen3.6`) genero las respuestas de entrenamiento en ingles, que despues fueron traducidas al italiano con TranslateGemma. Por otro, ilustra el uso de LoRA con Unsloth para adaptar un modelo base de 3B a una voz de personaje muy concreta con un conjunto de datos reducido (800 respuestas de entrenamiento), fusionando despues el adaptador a 16 bits antes de generar las cuantizaciones GGUF.

El modelo hereda la arquitectura y la ventana de contexto del Llama-3.2-3B-Instruct original, pero el ajuste es especifico para conversacion en italiano con estilo de personaje. El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 3B) |
| Parametros totales | 3.212.749.888 (aproximadamente 3,2 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.2; no confirmada de forma explicita en la informacion del repositorio) |
| Tipos de cuantizacion | q8_0 (8 bits) y q4_k_m (4 bits) |
| Idiomas soportados | italiano (it); el modelo base soporta adicionalmente ingles y otros idiomas, no verificados tras el ajuste |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (este repositorio); safetensors (repositorio base `WasamiKirua/Llama-3.2-3B-Alucard-IT`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only denso con atencion por grupos de consultas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El ajuste fino se realizo mediante LoRA utilizando la libreria Unsloth, partiendo del checkpoint `unsloth/Llama-3.2-3B-Instruct`. El adaptador resultante se fusiono a 16 bits en el modelo base antes de generar los ficheros GGUF, de modo que las cuantizaciones publicadas no parten de una copia a 4 bits del entrenamiento.

El proceso de construccion del conjunto de datos esta documentado en la model card. Un profesor local denominado `qwen3.6` genero las respuestas en ingles siguiendo un prompt de Alucard que no se almaceno en las filas del dataset; el modelo pequeno aprendio la voz a partir de las respuestas. Las frases humanas provienen del conjunto `perceptron-743/anime-train`, filtradas a una longitud de entre 30 y 50 caracteres, y se reservaron 20 prompts fuera del entrenamiento. El entrenamiento utilizo 800 respuestas y 80 filas incluyen ademas la instruccion `You are a helpful assistant.`, de modo que un prompt de sistema generico no elimina la voz del personaje. Cada turno fue traducido al italiano con TranslateGemma, dando lugar al fichero `train_ita.jsonl`. No se documenta el uso de RLHF ni de DPO.

## Capacidades

- Generacion de texto conversacional en italiano con la voz y el registro del personaje Alucard.
- Interpretacion de rol consistente: el modelo mantiene un estilo arrogante, solemne y leal a la figura de Integra, segun el ejemplo de control incluido en la model card.
- Conversacion multiturno en el dominio del personaje, con memoria dentro de la ventana de contexto heredada del modelo base.
- Capacidades generales de razonamiento y generacion de codigo y matematicas heredadas de Llama-3.2-3B-Instruct, no verificadas especificamente tras el ajuste.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta version ajustada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas en la practica al italiano por el enfoque del ajuste; el resto de idiomas del modelo base no se han evaluado tras el entrenamiento.
- Modo de pensamiento explicito (thinking mode), vision o audio: no disponible.

## Casos de uso

- Chatbots de rol y entretenimiento: el modelo esta disenado para encarnar a Alucard en italiano, por lo que es adecuado para aplicaciones de ficcion interactiva, novelas visuales o bots de comunidad donde se requiera una personalidad muy marcada.
- Personajes secundarios de videojuegos y experiencias narrativas: puede integrarse como motor de dialogo de un NPC con voz fija, gestionando conversaciones multiturno con la ventana de contexto larga del modelo base.
- Demostraciones de destilacion de estilo a bajo coste: sirve como ejemplo reproducible de como adaptar un modelo de 3B a una voz concreta con pocos cientos de ejemplos y un profesor local, util para investigadores que estudien tecnicas de imitacion de estilo.
- Prototipado rapido en italiano: al ser un modelo de 3B cuantizable a 4 bits, permite montar un prototipo conversacional en italiano en una GPU de consumo o incluso en CPU.
- Generacion de contenido creativo con tono especifico: redaccion de dialogos o textos con un registro dramatico y grandilocuente, aprovechando la voz aprendida.
- Educacion y evaluacion de tecnicas de cuantizacion: el repositorio ofrece dos niveles (q8_0 y q4_k_m) del mismo modelo fusionado, lo que permite comparar el impacto de la cuantizacion sobre la coherencia del personaje.
- Experimentacion con licencias permisivas: al heredar la Llama 3.2 Community License, puede utilizarse como banco de pruebas interno en proyectos que ya cumplen dicha licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una comprobacion cualitativa con un prompt reservado fuera del entrenamiento, sin metricas numericas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para la cuantizacion q4_k_m y 3,5-4 GB para q8_0, incluyendo margen de contexto.
- Compatible con GPUs de consumo: cabe en tarjetas con 4-6 GB de VRAM o mas, como RTX 3050, RTX 3060, RTX 4060 o superiores.
- GPU recomendadas para mayor rendimiento: RTX 4090, RTX 3090, A100 o H100 si se busca alto throughput o contextos muy largos.
- Ejecucion en CPU: viable mediante llama.cpp, con latencia mayor pero funcional para uso individual.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y, para safetensors, vLLM o TGI. El autor indica explicitamente no emplear los ficheros GGUF como checkpoint de entrenamiento.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| WasamiKirua/Llama-3.2-3B-Alucard-IT-GGUF | 3,2B | 128.000 tokens (heredado, sin confirmar) | Italiano | Llama 3.2 Community | GGUF (q8_0, q4_k_m) |
| unsloth/Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens | Multilingue | Llama 3.2 Community | safetensors |
| Otros ajustes de personaje sobre Llama 3.2 3B | 3,2B | 128.000 tokens | Variable | Llama 3.2 Community | safetensors / GGUF |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, idioma, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo ha sido ajustado sobre un corpus de personaje con un registro agresivo y arrogante, por lo que puede generar respuestas hostiles o inapropiadas fuera del contexto de ficcion.
- Riesgo de alucinacion: elevado, tanto por el tamano reducido (3,2B) como por el enfoque en imitacion de estilo, que prioriza la voz sobre la veracidad. El ejemplo de la model card muestra al modelo afirmando ser un personaje ficticio.
- Limitaciones de contexto: aunque hereda la ventana del modelo base, no se ha verificado que el ajuste conserve el rendimiento en contextos largos.
- Limitaciones de idioma: el entrenamiento se realizo integramente en italiano, por lo que el comportamiento en otros idiomas puede degradarse.
- Restricciones de licencia: hereda la Llama 3.2 Community License, que impone condiciones especificas para uso comercial y exige el cumplimiento de la politica de uso aceptable de Meta. Es necesario revisar dichos terminos antes de un despliegue en produccion.
- Caveat sobre el origen de los datos: la model card indica que el conjunto de entrenamiento deriva de `perceptron-743/anime-train`, cuya licencia y condiciones de uso deben verificarse de forma independiente.
- Caveat sobre el uso: los ficheros GGUF estan pensados unicamente para inferencia, no como checkpoint de entrenamiento.
- Repositorio con 0 descargas y 0 likes: no existe validacion por parte de la comunidad ni garantia de mantenimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/WasamiKirua/Llama-3.2-3B-Alucard-IT-GGUF
- Repositorio del modelo en safetensors: https://huggingface.co/WasamiKirua/Llama-3.2-3B-Alucard-IT
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Conjunto de datos de referencia: https://huggingface.co/datasets/perceptron-743/anime-train
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Paper de Llama 3: no disponible en la informacion proporcionada.
