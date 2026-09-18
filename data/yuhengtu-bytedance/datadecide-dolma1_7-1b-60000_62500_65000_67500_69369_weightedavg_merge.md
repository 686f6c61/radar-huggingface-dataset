# yuhengtu-bytedance/DataDecide-dolma1_7-1B-60000_62500_65000_67500_69369_weightedavg_merge

## Resumen

DataDecide-dolma1_7-1B-60000_62500_65000_67500_69369_weightedavg_merge es un modelo de lenguaje de 1.279.854.592 parametros (aproximadamente 1,28 mil millones) publicado por el usuario yuhengtu-bytedance en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una fusion de pesos (model merge) generada con la herramienta mergekit a partir de cinco checkpoints intermedios de un mismo entrenamiento de aproximadamente 1B de parametros sobre el dataset dolma1_7. Los checkpoints fusionados corresponden a los pasos 60000, 62500, 65000, 67500 y 69369, con pesos crecientes de 1 a 5 respectivamente y normalizacion activada.

El modelo pertenece a la familia de arquitecturas Llama (etiqueta `llama` en el repositorio) y se distribuye en formato safetensors con pesos en bfloat16, con un tamano de repositorio de 2,6 GB. La relevancia de esta publicacion es fundamentalmente de investigacion: sirve como artefacto para estudiar tecnicas de media de pesos entre checkpoints de un mismo run (weighted averaging / model soups) y su efecto sobre el rendimiento final, en el contexto del proyecto de medicion Pan_Safety_Better_Measurement que aparece en las rutas de origen.

Conviene subirar que se trata de un modelo base (base model) sin ajuste por instrucciones, sin datos de benchmarks publicados y sin licencia ni idiomas declarados en la model card. Por tanto, su uso en produccion requiere evaluacion propia previa y una verificacion juridica de la licencia, que no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only, segun la etiqueta `llama` del repositorio) |
| Parametros totales | 1.279.854.592 (aproximadamente 1,28B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; al ser arquitectura Llama es convertible a GGUF, GPTQ o AWQ con herramientas estandar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16); el merge se calculo en float32 y se exporto con out_dtype bfloat16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Llama con aproximadamente 1,28B de parametros, segun el recuento real de tensores en safetensors. No hay informacion publicada sobre el numero de capas, dimensiones de atencion, cabezas, vocabulario o mecanismos adicionales (atencion lineal, decodificacion especulativa, etc.) en la documentacion disponible.

El entrenamiento subyacente no se describe en la model card. Lo unico inferible de las rutas de los checkpoints es que se trata de un run sobre el dataset dolma1_7 con al menos 69.369 pasos de optimizacion, del que se han fusionado cuatro checkpoints previos mas el checkpoint final. La fusion se realizo con mergekit usando el metodo Linear (referencia arXiv:2203.05482, correspondiente a la tecnica de model soups), con `normalize: true`, lo que reescala los pesos para que sumen uno. Los pesos normalizados resultantes son: paso 60000 con peso 1, paso 62500 con peso 2, paso 65000 con peso 3, paso 67500 con peso 4 y paso 69369 con peso 5. No se indica si hubo RLHF, DPO u otra fase de alineamiento posterior; por las caracteristicas del artefacto, lo mas probable es que no la haya, pero no esta confirmado.

## Capacidades

- Generacion de texto autoregresiva basica, en modo continuacion de texto (modelo base, no ajustado por instrucciones).
- Razonamiento y conocimiento general: no verificados; no hay evaluaciones publicadas en la informacion disponible.
- Generacion de codigo y matematicas: no verificado; no hay datos publicados.
- Tool calling / function calling: no disponible; no se declara soporte de plantillas de chat ni de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Capacidades especiales (modo thinking, vision, audio): ninguna declarada.
- Compatibilidad con text-generation-inference y endpoints compatibles con la API de inferencia, segun las etiquetas del repositorio.

## Casos de uso

- Investigacion sobre fusion de pesos: el modelo es un caso de estudio directo de media ponderada de checkpoints de un mismo run. Se puede reproducir el merge con mergekit a partir de los mismos pasos y comparar el checkpoint fusionado contra cada checkpoint individual en una tarea de validacion propia.
- Analisis de dinamica de entrenamiento: al proceder de pasos consecutivos (60000 a 69369) de un mismo entrenamiento, permite estudiar como evolucionan las perdidas por dominio o el olvido catastrofico segun avanza el entrenamiento sobre dolma1_7.
- Modelo base para fine-tuning: sus 1,28B de parametros lo hacen manejable para ajuste completo o con LoRA en una unica GPU de 24 GB, sirviendo como punto de partida en experimentos academicos de ajuste supervisado.
- Generacion de texto en hardware limitado: con cuantizacion a 8 o 4 bits, el modelo cabe en GPUs de gama media e incluso en CPU, lo que permite desplegarlo en entornos de demostracion o prototipado sin infraestructura dedicada.
- Generacion de datos sinteticos para destilacion: en modo completado de texto se puede usar para producir corpus sinteticos a granel, con la advertencia de que no hay filtrado de seguridad ni evaluacion de calidad.
- Experimentos de seguridad y medicion de sesgos: dado el contexto del proyecto de origen (Pan_Safety_Better_Measurement), puede emplearse como sujeto de pruebas para medir como la fusion de checkpoints afecta a comportamientos indeseados.
- Reproducibilidad en pipelines de CI: al ser un artefacto pequeno y autocontenido, es adecuado para pruebas de integracion de librerias de inferencia (transformers, vLLM, llama.cpp) sin coste elevado de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, GSM8K, HumanEval ni similares) y la busqueda web realizada no devolvio resultados tecnicos relacionados con este modelo.

## Requisitos de hardware

- VRAM estimada en bfloat16 o float16: aproximadamente 2,6 GB solo para pesos; con cache KV y overhead de runtime, del orden de 3,5 a 5 GB para contextos moderados (la cifra exacta depende de la longitud de contexto, que no esta disponible).
- VRAM estimada en int8: aproximadamente 1,3 a 1,5 GB de pesos.
- VRAM estimada en 4 bits (GGUF Q4_K_M o similar): aproximadamente 0,8 a 1 GB de pesos.
- Cabe en GPU de consumo: si, con holgura. Funciona en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y tambien en tarjetas de 6-8 GB si se cuantiza a 4 bits.
- CPU: inferencia viable con llama.cpp u Ollama tras convertir los pesos a GGUF, con velocidades dependientes del numero de nucleos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference, vLLM, llama.cpp, Ollama y servidores compatibles con la API de endpoints. Para vLLM y TGI se requieren pesos en safetensors, ya presentes en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se ofrece a titulo orientativo; los datos de los modelos alternativos son de conocimiento publico general y no se han verificado en esta busqueda. El modelo objeto de la ficha no tiene benchmarks publicados, por lo que la columna de rendimiento queda sin datos.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| DataDecide-dolma1_7-1B (fusión) | 1,28B | no disponible | no disponible | safetensors (bf16) | no disponible |
| Llama 3.2 1B (Meta) | 1,24B | 128k | Llama 3.2 Community License | safetensors, GGUF | si (MMLU, GSM8K, etc.) |
| Qwen2.5-1.5B (Alibaba) | 1,54B | 32k (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF | si |
| TinyLlama-1.1B (proyecto comunitario) | 1,1B | 2048 | Apache 2.0 | safetensors, GGUF | si |

Frente a estas alternativas, el modelo aqui descrito no ofrece garantias de licencia, idioma ni rendimiento verificado, por lo que solo resulta preferible en escenarios de investigacion sobre fusion de pesos o cuando se necesite especificamente un checkpoint derivado de dolma1_7.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde de forma fiable a prompts conversacionales ni sigue instrucciones complejas.
- No hay licencia declarada. Esto impide determinar si el uso comercial esta permitido; se debe contactar con el autor antes de cualquier despliegue productivo.
- No hay idiomas declarados. El nombre del dataset de origen (dolma1_7) apunta a un corpus mayoritariamente en ingles segun la documentacion publica de dicho dataset, pero esto no se ha verificado para este modelo concreto.
- No existe ninguna evaluacion publicada: se desconoce el rendimiento en tareas de razonamiento, codigo, matematicas o conocimiento factual.
- Riesgo de alucinacion propio de un modelo base de 1,28B: la precision factica sera limitada y no hay garantia de coherencia en generaciones largas.
- No hay filtros de seguridad ni alineamiento documentados; puede reproducir sesgos y contenido toxico presente en los datos de preentrenamiento.
- La longitud de contexto es desconocida, lo que dificulta dimensionar la cache KV y planificar aplicaciones con entradas largas.
- Al ser una media de checkpoints, el merge puede degradar capacidades especificas que estaban presentes en alguno de los checkpoints individuales; no hay validacion publicada que lo confirme o lo descarte.
- La model card declara `base_model: []` en los metadatos pero las rutas del YAML apuntan a checkpoints locales no publicados, por lo que el linaje exacto no es reproducible con recursos publicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-dolma1_7-1B-60000_62500_65000_67500_69369_weightedavg_merge
- mergekit (herramienta de fusion): https://github.com/cg123/mergekit
- Paper del metodo Linear referenciado en la model card (model soups): https://arxiv.org/abs/2203.05482
- La busqueda web realizada no devolvio ningun enlace tecnico relevante sobre este modelo, su entrenamiento o sus evaluaciones.
