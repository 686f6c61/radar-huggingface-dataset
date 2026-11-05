# tetranigga/TetraNigga-LSD-10M-GGUF

## Resumen

TetraNigga-LSD-10M es un modelo de generacion de texto de escala muy reducida (9.966.848 parametros, es decir, aproximadamente 10 millones) publicado por el usuario `tetranigga` en HuggingFace bajo el identificador `tetranigga/TetraNigga-LSD-10M-GGUF`. Se distribuye unicamente en formato GGUF (F16) y utiliza la arquitectura Llama, segun indica la propia model card. El autor lo presenta como "third fastest ai ever" y como un modelo entrenado desde cero ("from scratch") y ajustado para conversaciones, con un formato de dialogo basado en SentencePiece por componentes.

El modelo esta etiquetado como `experimental` y `conversational`, con soporte declarado unicamente para ingles (`en`). No se especifica licencia, no se documentan datos de entrenamiento, no se publican resultados de benchmarks y el repositorio no tiene descargas ni interacciones en el momento de la consulta. Su relevancia practica es, por tanto, muy limitada: se trata de un experimento de escala minuscula, no de un modelo destinado a produccion.

Esta ficha describe lo poco que el autor declara explicitamente y marca como "no disponible" todo aquello que la informacion proporcionada no cubre. Cualquier evaluacion de capacidades reales requeriria ejecutar el modelo, algo que no se ha hecho aqui y que no se puede inferir de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only, segun la model card) |
| Parametros totales | 9.966.848 (~10M) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en F16 (unico formato publicado) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (F16) |

## Arquitectura y entrenamiento

La model card indica que el modelo usa la arquitectura Llama y que fue "trained from scratch" (entrenado desde cero) y posteriormente ajustado para conversaciones. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT mas alla de la mencion generica al ajuste conversacional.

El aspecto tecnico mas concreto que declara el autor es el uso de un formato de conversacion basado en SentencePiece "component-wise" (por componentes), con un tokenizer propio incluido en el repositorio y un adaptador en Python pensado para usarse con la API `/completion` de llama.cpp. Esto implica que el prompt de chat no sigue las convenciones habituales de otros modelos y que, para obtener respuestas coherentes en modo conversacional, es necesario emplear ese tokenizer y ese adaptador especificos. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto en ingles, segun la etiqueta de idioma declarada.
- Modo conversacional: el autor afirma que el modelo esta ajustado para conversaciones, con un formato de prompt propio basado en SentencePiece.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a traves de infraestructura compatible con la API de HuggingFace.
- Integracion con llama.cpp mediante la API `/completion`, usando el tokenizer y el adaptador Python incluidos.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad de vision, audio ni modo "thinking".
- No se declaran capacidades de codigo o matematicas.

## Casos de uso

- Pruebas de integracion con llama.cpp: el modelo sirve para validar pipelines de despliegue con GGUF y la API `/completion` en entornos de desarrollo, dado su tamano minimo y su formato F16.
- Experimentacion educativa sobre tokenizers: el formato de conversacion "component-wise" con SentencePiece permite estudiar como se construyen y aplican plantillas de chat personalizadas en modelos pequenos.
- Prototipado de chatbots de juguete: para demostraciones internas o tests de interfaz donde la calidad de respuesta no es critica y prima la velocidad de carga.
- Pruebas de regresion de infraestructura: util como modelo "dummy" para verificar que un servidor de inferencia (por ejemplo, basado en llama.cpp) arranca, acepta peticiones y devuelve texto.
- Investigacion sobre modelos de escala minuscula: analisis de los limites de capacidad de un transformer de ~10M parametros entrenado desde cero para dialogo.
- Evaluacion de adaptadores personalizados: el adaptador Python incluido permite probar como se integra un tokenizer no estandar con clientes HTTP de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~10M parametros en F16, el peso ocupa aproximadamente 20 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (GTX 1050, RTX 3060, etc.), y tambien en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF) y servidores compatibles con la API `/completion`; no se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; el autor afirma de forma no verificada que es "third fastest ai ever", pero no se aportan mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos conversacionales de ~10M parametros entrenados desde cero), y no se dispone de datos de rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Escala muy reducida (~10M parametros): la capacidad de razonamiento, coherencia y conocimiento factual sera previsiblemente muy limitada en comparacion con modelos de miles de millones de parametros.
- Riesgo elevado de alucinacion y de respuestas incoherentes, especialmente fuera de dominios simples.
- Solo soporta ingles segun la etiqueta declarada; no hay soporte documentado de castellano.
- No se especifica licencia, lo que impide determinar si el uso comercial esta permitido; debe tratarse como no apto para produccion hasta que el autor aclare la licencia.
- Formato de prompt no estandar: requiere el tokenizer y el adaptador especificos del autor; usar plantillas de chat convencionales puede degradar la calidad de forma impredecible.
- Modelo marcado como `experimental`, sin benchmarks, sin documentacion de datos de entrenamiento y sin descargas ni validacion por parte de la comunidad.
- No se declaran capacidades de tool calling, agentes, vision ni audio, por lo que no debe asumirse ninguna de ellas.
- El nombre del repositorio y del autor incluyen terminos ofensivos; conviene tenerlo en cuenta antes de referenciarlo en contextos profesionales o publicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tetranigga/TetraNigga-LSD-10M-GGUF
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
