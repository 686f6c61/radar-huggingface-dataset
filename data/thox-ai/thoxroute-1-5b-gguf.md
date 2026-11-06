# Thox-ai/ThoxRoute-1.5B-GGUF

## Resumen

ThoxRoute-1.5B-GGUF es la version cuantizada en formato GGUF del modelo ThoxRoute-1.5B, desarrollado por THOX.ai. No se trata de un asistente conversacional general, sino de un modelo de enrutamiento de intenciones y preferencias (intent/preference routing) disenado para funcionar en dispositivos locales dentro del ecosistema THOX (ThoxOS, MeshStack). Su funcion es seleccionar a que modelo o ruta derivar una peticion, no generar la respuesta final.

El modelo base cuenta con 1.543.714.304 parametros (aproximadamente 1,5B) y se distribuye bajo licencia Apache-2.0. Esta version concreta contiene un unico fichero GGUF con cuantizacion Q4_K_M de 986.047.936 bytes (unos 0,99 GB), lo que lo hace apto para equipos con al menos 4 GB de RAM. Esta pensado para su uso con llama.cpp, Ollama y LM Studio, y tambien esta publicado en la libreria de Ollama como `thox-ai/thoxroute`.

Su relevancia radica en el enfoque local-first: permite tomar decisiones de enrutamiento en el propio dispositivo sin depender de la nube, algo util en arquitecturas de agentes y sistemas multi-modelo donde se necesita decidir dinamicamente que modelo atiende cada consulta. La model card advierte explicitamente de que no es un asistente general ni esta alineado en seguridad para exposicion publica directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de 1,5B; detalles de arquitectura no publicados en la informacion disponible) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico build publicado en este repositorio) |
| Idiomas soportados | en (ingles; el entrenamiento es mayoritariamente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`thoxroute-1.5b-Q4_K_M.gguf`, 986.047.936 bytes) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Thox-ai/ThoxRoute-1.5B mas alla de su tamano (1,5B parametros) y su naturaleza de modelo de enrutamiento. La model card indica que se trata de un fine-tune de THOX sobre el modelo base y que el corpus y el procedimiento se describen en la propia card tal como se publicaron en el lanzamiento, sin aportar cifras de tokens de entrenamiento, composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. No se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal.

El proceso aplicado en este repositorio es la fusion (merge) y cuantizacion a Q4_K_M del adaptador de enrutamiento de THOX. La model card advierte de que la cuantizacion a Q4_K_M puede alterar las decisiones de enrutamiento en los margenes. Se utiliza una plantilla de chat con formato ChatML (`<|im_start|>system ... <|im_end|>`), lo que facilita su integracion en pipelines existentes compatibles con este formato.

## Capacidades

- Enrutamiento de intenciones y preferencias: clasifica la peticion del usuario y selecciona la ruta o modelo adecuado dentro de una arquitectura multi-modelo.
- Clasificacion de texto orientada a decision de routing (tag `classifier` en el repositorio).
- Ejecucion on-device y en el edge: disenado para funcionar localmente con llama.cpp, Ollama y LM Studio.
- Integracion en el stack THOX (ThoxOS, MeshStack) como componente de decision previo a la generacion.
- Soporte de plantilla de chat ChatML para conversaciones con roles system/user/assistant.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No es un generador de respuestas finales: no se le atribuyen capacidades de razonamiento complejo, codigo, matematicas, vision ni audio en la informacion disponible.
- No se documenta soporte de tool calling ni de agentes multi-paso mas alla de su papel como router.

## Casos de uso

- Enrutamiento local en asistentes multi-modelo: el modelo recibe la consulta del usuario y decide si derivarla a un modelo pequeno local, a un modelo mayor o a un servicio remoto, reduciendo coste y latencia al evitar invocar modelos grandes para peticiones simples.
- Clasificacion de intenciones en dispositivos con recursos limitados: con ~0,99 GB en Q4_K_M y un requisito de 4 GB de RAM, puede ejecutarse en portatiles, mini-PC o dispositivos edge para categorizar peticiones antes de procesarlas.
- Puerta de entrada en arquitecturas de agentes: actua como primer eslabon que determina la ruta (herramienta, modelo o flujo) en funcion de la intencion detectada, integrandose en pipelines orquestados.
- Filtrado y priorizacion de consultas en atencion al cliente automatizada: clasifica el tipo de solicitud para dirigirla al departamento, bot o modelo especializado correspondiente, siempre dentro de un sistema con guardrails.
- Enrutamiento de preferencias en entornos local-first: en despliegues donde la privacidad impide enviar datos a la nube, el modelo decide localmente como tratar la peticion sin exponer el contenido.
- Componente de seleccion en sistemas MeshStack/ThoxOS: se integra como modulo de decision dentro del ecosistema THOX para distribuir cargas entre nodos o modelos disponibles.
- Prototipado de routers personalizados: sirve como base para experimentar con enrutamiento de intenciones en ingles antes de entrenar variantes propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultado GATE49 de THOX publicado para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1 GB para los pesos en Q4_K_M; la model card indica que esta dimensionado para dispositivos con al menos 4 GB de RAM.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cabe en GPUs consumer de gama media y baja (por ejemplo, tarjetas con 4-8 GB de VRAM), aunque no hay confirmacion oficial.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 4 GB de VRAM; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/Thox-ai/ThoxRoute-1.5B-GGUF:Q4_K_M` o `thox-ai/thoxroute`) y LM Studio. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de enrutamiento con los que establecer una comparacion fiable de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- No es un asistente general: selecciona rutas; la calidad de la respuesta final depende del modelo al que se enruta.
- No esta alineado en seguridad para exposicion publica directa; debe desplegarse detras de los guardrails de THOX en cualquier ruta de cara al publico.
- La cuantizacion a Q4_K_M puede modificar las decisiones de enrutamiento en los margenes respecto al modelo sin cuantizar.
- El entrenamiento es mayoritariamente en ingles; el rendimiento en otros idiomas es inferior.
- El comportamiento y los sesgos reflejan los datos de entrenamiento, no documentados en detalle.
- Fuera de alcance: decisiones medicas, legales, financieras o de seguridad critica sin revision humana, y control no supervisado de dispositivos fisicos sin paso de confirmacion.
- No se publican resultados de evaluacion (GATE49) que permitan validar el rendimiento del enrutamiento.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar el texto de la licencia para los terminos aplicables a las adiciones de THOX.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/Thox-ai/ThoxRoute-1.5B-GGUF
- Modelo base: https://huggingface.co/Thox-ai/ThoxRoute-1.5B
- Ollama (referencia en la model card): `thox-ai/thoxroute`
