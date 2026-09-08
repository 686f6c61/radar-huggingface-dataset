# VaSy365/llama3.2-3b-legal-id-ft

## Resumen

El modelo `VaSy365/llama3.2-3b-legal-id-ft` es un finetuning de `unsloth/llama-3.2-3b-instruct-bnb-4bit`, que a su vez es la versión cuantizada a 4 bits del modelo Llama 3.2 3B Instruct de Meta. El autor, VaSy365, ha publicado el modelo bajo licencia Apache 2.0 con el objetivo aparente de adaptarlo a tareas del ámbito legal, tal y como sugiere el nombre `legal-id`. No obstante, no se ha publicado documentación alguna sobre el dataset de entrenamiento, el proceso de ajuste ni los resultados obtenidos, por lo que las capacidades concretas del finetuning resultan desconocidas.

Arquitectónicamente se trata de un modelo transformer decoder-only con 3.212.749.824 parámetros, lo que lo sitúa en la gama de modelos ligeros de 3B. Su tamaño reducido permite desplegarlo en hardware modesto, y al estar basado en Llama 3.2 mantiene la vocación de asistente instructivo para generación de texto en inglés. La relevancia del modelo es limitada, dado que no se ofrecen evaluaciones ni especificaciones de uso más allá de la propia publicación en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/llama-3.2-3b-instruct-bnb-4bit`, una versión del modelo Llama 3.2 3B de Meta cargada en 4 bits. El autor indica que se realizó un finetuning empleando la librería TRL de HuggingFace y la optimización de Unsloth, que reduce el tiempo de entrenamiento aproximadamente a la mitad. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. El resultado es un modelo con pesos en formato safetensors y con la misma capacidad de generación instructiva que el modelo base, adaptado presumiblemente a un dominio legal no especificado.

## Capacidades

- Generacion de texto instructivo en ingles, heredada del modelo base.
- Capacidad conversacional en formato chat, gracias al finetuning sobre el modelo instruct.
- No se documentan capacidades de tool calling ni function calling.
- No se documenta soporte de vision, audio ni otras modalidades.
- No se documenta soporte de razonamiento multistep ni modo thinking.
- No se han publicado benchmarks ni evaluaciones que confirmen capacidades especificas en el dominio legal.

## Casos de uso

- Asistente de redaccion de documentos legales basicos: el modelo puede generar borradores de clausulas, contratos sencillos o avisos legales en ingles, siempre que el dataset de finetuning haya incluido ejemplos de este tipo. Su tamano de 3B lo hace adecuado para entornos con poca capacidad de computo.
- Resumen de contratos o textos legales: se puede emplear para extraer puntos clave de documentos, aunque sin validacion humana debido a la ausencia de evaluaciones publicadas.
- Atencion al cliente en el sector legal: el modelo puede responder consultas frecuentes sobre procedimientos legales, apoyandose en el contexto conversacional del modelo base.
- Generacion de correos formales: su naturaleza instructiva permite redactar comunicaciones profesionales vinculadas a asuntos legales o administrativos.
- Clasificacion preliminar de documentos: mediante prompts de instruccion, es posible categorizar textos legales o identificar secciones relevantes, aunque esta capacidad no ha sido verificada.
- Prototipado de chatbots juridicos: al ser un modelo ligero y con licencia permisiva, sirve para experimentar con interfaces de texto en ingles sin necesidad de infraestructura avanzada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio contiene pesos en safetensors de aproximadamente 6,4 GB, por lo que se estima una necesidad minima de 7 GB de VRAM para carga en FP16. Con cuantizaciones adicionales la cifra puede reducirse, aunque no se proporcionan.
- GPU recomendadas: se recomienda una GPU con 8 GB de VRAM o superior, como RTX 3060 12GB, RTX 4060 Ti 16GB o una A100/H100 para despliegues en produccion.
- Es viable en GPU de consumo: si se aplica cuantizacion adicional, es probable que funcione en tarjetas con 6-8 GB de VRAM, pero no hay configuraciones publicadas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y la libreria Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VaSy365/llama3.2-3b-legal-id-ft | 3.212.749.824 | no disponible | Apache 2.0 | HuggingFace |
| unsloth/llama-3.2-3b-instruct-bnb-4bit | 3.212.749.824 | 128.000 (modelo base) | Llama 3.2 Community License | HuggingFace |
| Meta Llama 3.2 3B Instruct | 3.212.749.824 | 128.000 | Llama 3.2 Community License | HuggingFace / Meta |

## Limitaciones y advertencias

- No se ha publicado el dataset de entrenamiento, por lo que los sesgos del finetuning son desconocidos.
- Al ser un finetuning sin RLHF/DPO documentado, existe un riesgo significativo de alucinacion en tareas legales donde la precision es critica.
- El modelo solo soporta el idioma ingles, segun los metadatos de HuggingFace.
- La licencia declarada es Apache 2.0, pero el modelo base Llama 3.2 esta sujeto a la licencia de Meta, lo que puede generar incompatibilidades legales en el uso comercial del derivado. Conviene revisar la licencia del modelo base antes de desplegarlo en produccion.
- No se han proporcionado benchmarks ni pruebas de robustez, por lo que su rendimiento real es incierto.
- El contexto largo no esta verificado, y un finetuning de este tipo puede degradar la capacidad de manejar ventanas de 128K tokens si no se entreno con datos suficientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VaSy365/llama3.2-3b-legal-id-ft
- Modelo base cuantizado: https://huggingface.co/unsloth/llama-3.2-3b-instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
