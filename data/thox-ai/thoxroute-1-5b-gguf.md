# Thox-ai/ThoxRoute-1.5B-GGUF

## Resumen

ThoxRoute-1.5B-GGUF es la distribucion cuantizada en formato GGUF (Q4_K_M) del modelo ThoxRoute-1.5B, un modelo de enrutamiento de intenciones y preferencias desarrollado por THOX.ai. No es un asistente conversacional general, sino un clasificador/enrutador que decide que ruta o modelo debe atender una peticion dentro del stack THOX (ThoxOS, MeshStack). El repositorio contiene un unico fichero de pesos de 986.047.936 bytes (~0,99 GB), pensado para inferencia on-device y en el edge con llama.cpp, Ollama y LM Studio.

El modelo base cuenta con 1.543.714.304 parametros (aproximadamente 1,5B) y se distribuye bajo licencia Apache-2.0. Esta orientado a dispositivos con al menos 4 GB de RAM y a entornos local-first donde la privacidad y la ausencia de dependencia de la nube son requisitos. La ventana de contexto no se especifica en la informacion disponible.

Su relevancia actual radica en la tendencia hacia arquitecturas de enrutamiento local: en lugar de enviar todas las peticiones a un unico modelo grande, ThoxRoute selecciona la ruta adecuada, lo que permite optimizar coste, latencia y privacidad en despliegues de multiples modelos. El autor advierte explicitamente de que no esta alineado para seguridad ni pensado para exposicion publica directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se detalla variante en la informacion disponible) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico publicado en este repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `thoxroute-1.5b-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de tratarse de un transformer de 1,5B parametros afinado por THOX.ai sobre el modelo base Thox-ai/ThoxRoute-1.5B. La model card indica que el corpus y el procedimiento de entrenamiento se describen "tal como se publicaron en el lanzamiento" en la tarjeta del modelo base, sin que este repositorio anada entrenamiento adicional.

El modelo es un fine-tune de THOX orientado a enrutamiento de intenciones y preferencias. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras tecnicas de alineacion. La cuantizacion a Q4_K_M se realizo para despliegue on-device, y el autor advierte de que puede alterar decisiones de enrutamiento en los margenes. El template de chat sigue el formato ChatML (`<|im_start|>system ... <|im_end|>`).

## Capacidades

- Enrutamiento de intenciones y preferencias: clasifica la peticion del usuario y selecciona la ruta o modelo adecuado dentro del stack THOX.
- Clasificacion de texto orientada a decision de ruta (tag `classifier`).
- Inferencia on-device y en el edge con llama.cpp, Ollama y LM Studio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Generacion de texto en formato conversacional (pipeline `text-generation`) segun el template ChatML.
- Capacidad multilingue limitada: entrenado principalmente en ingles, con calidad inferior en otros idiomas.
- No se documentan tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Enrutamiento local de peticiones en asistentes de escritorio: el modelo clasifica cada consulta y decide si enviarla a un modelo local pequeno, a uno mayor o a un servicio remoto, reduciendo coste y latencia en dispositivos con 4 GB de RAM o mas.
- Orquestacion de multiples modelos en un mismo dispositivo: dentro de ThoxOS o MeshStack, ThoxRoute actua como despachador que selecciona el especialista adecuado (codigo, resumen, conversacion) sin exponer datos a la nube.
- Filtrado previo de intenciones en aplicaciones de productividad: clasificar peticiones entrantes para dirigirlas a modulos concretos (calendario, notas, busqueda) con una huella de memoria inferior a 1 GB.
- Despliegue en el edge con Ollama: usar `ollama run hf.co/Thox-ai/ThoxRoute-1.5B-GGUF:Q4_K_M` para integrar enrutamiento en flujos local-first sin infraestructura dedicada.
- Preprocesado en pipelines de atencion al cliente: determinar la intencion de la consulta antes de invocar el modelo de respuesta, mejorando la precision de la derivacion a colas o agentes.
- Investigacion sobre enrutamiento de preferencias: servir como componente de referencia para experimentos de seleccion de modelo y evaluacion de politicas de despacho en entornos controlados.
- Prototipado de arquitecturas mesh: usar el modelo como nodo de decision en sistemas distribuidos de multiples modelos, con la advertencia de desplegarlo detras de los guardrails de THOX en cualquier ruta publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se publica ningun resultado de THOX GATE49 para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1 GB de pesos en Q4_K_M; el autor indica que esta dimensionado para dispositivos con al menos 4 GB de RAM.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cabe en GPU de consumo con 4 GB o mas de VRAM.
- Cabe en GPU de consumo: si, por el tamano del fichero (~0,99 GB) y el requisito de 4 GB de RAM del autor.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/Thox-ai/ThoxRoute-1.5B-GGUF:Q4_K_M`), LM Studio. Tambien disponible en la libreria de Ollama como `thox-ai/thoxroute`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (enrutadores de intenciones de ~1,5B) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Es un enrutador, no un respondedor: selecciona rutas; la calidad de la respuesta final depende del modelo al que se enrute.
- La cuantizacion a Q4_K_M puede cambiar las decisiones de enrutamiento en los margenes respecto al modelo base.
- El comportamiento y los sesgos reflejan los datos de entrenamiento, mayoritariamente en ingles; la calidad en otros idiomas es inferior.
- No esta alineado para seguridad ni pensado para exposicion publica directa; debe desplegarse detras de los guardrails de THOX en cualquier ruta publica.
- Fuera de alcance: decisiones medicas, legales, financieras, de seguridad critica u otras de alto riesgo sin revision humana; control no supervisado de dispositivos fisicos sin paso de confirmacion.
- Riesgo de alucinacion y de clasificacion erronea no cuantificado en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte y remite al texto de la licencia para los terminos.
- No se publica evaluacion (THOX GATE49) para este modelo, lo que limita la validacion objetiva de su rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thox-ai/ThoxRoute-1.5B-GGUF
- Modelo base: https://huggingface.co/Thox-ai/ThoxRoute-1.5B
- Libreria de Ollama: `thox-ai/thoxroute`
