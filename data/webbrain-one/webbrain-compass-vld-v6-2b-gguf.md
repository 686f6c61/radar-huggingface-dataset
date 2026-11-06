# webbrain-one/webbrain-compass-vld-v6-2b-gguf

## Resumen

WebBrain Compass VLD v6 (2B) es un modelo multimodal de tipo image-text-to-text desarrollado por webbrain-one, orientado especificamente a la toma de decisiones en agentes de navegador. Se distribuye como cuantizaciones GGUF del modelo base `webbrain-one/webbrain-compass-vld-v6-2b`, lo que permite su ejecucion local mediante `llama.cpp` e incluso en navegador a traves de WebGPU. El modelo cuenta con 1.728.801.600 parametros reales (aproximadamente 1,7B) y combina un backbone de lenguaje con un proyector visual multimodal separado.

La propuesta del modelo es cubrir una necesidad concreta: proporcionar un componente ligero capaz de interpretar capturas de pantalla y contexto de pagina web para decidir la siguiente accion dentro de un flujo de agente navegador. Los tags de la model card lo etiquetan como `browser-agent`, `decision-model`, `liquid` y `lfm3`, lo que sugiere una base derivada de la familia LFM (Liquid Foundation Models). Su licencia es `lfm1.0` (etiquetada como "other" en Hugging Face).

El repositorio GGUF incluye cuatro artefactos: pesos cuantizados Q4_K_M (1,1 GB), Q8_0 (1,8 GB), BF16 sin cuantizar (3,3 GB) y el proyector multimodal `mmproj` en F16 (362 MB). Esta fragmentacion esta pensada para despliegues con restricciones de memoria, incluyendo entornos de ejecucion en cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `liquid`/`lfm3`; transformer multimodal con proyector visual) |
| Parametros totales | 1.728.801.600 (~1,7B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `--ctx-size 16384` |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 (mas proyector visual F16) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas de la model card, que apuntan a una base de la familia LFM3 de Liquid (`liquid`, `lfm3`) adaptada como modelo de decision para agentes de navegador (`browser-agent`, `decision-model`, `webbrain-vld`). El pipeline declarado es `image-text-to-text`, y el repositorio separa explicitamente un proyector multimodal (`mmproj-webbrain-compass-vld-v6-2b-F16.gguf`, 362 MB) de los pesos del modelo de lenguaje, lo que confirma una arquitectura multimodal con encoder/proyector visual acoplado a un decoder de texto.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, modos de razonamiento extendido) mas alla del flag `--reasoning off` presente en el ejemplo de `llama-server`, que sugiere la existencia de un modo de razonamiento desactivable.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Comprension de imagenes y texto combinados (pipeline `image-text-to-text`), orientada a la interpretacion de capturas de pantalla y contenido de paginas web.
- Toma de decisiones para agentes de navegador: el modelo esta disenado como `decision-model` dentro de un bucle de agente.
- Integracion con `llama.cpp` mediante `llama-server`, con soporte de plantillas de chat via `--jinja`.
- Ejecucion en navegador mediante WebGPU segun la model card.
- Modo de razonamiento configurable (flag `--reasoning off` en el ejemplo de uso).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Agentes de navegador autonomos: el modelo recibe el estado visual de la pagina (captura de pantalla) y el contexto textual para decidir la siguiente accion (clic, escritura, navegacion). Su tamano de ~1,7B y la cuantizacion Q4_K_M de 1,1 GB lo hacen adecuado para bucles de decision con latencia baja.
- Automatizacion de pruebas end-to-end en web: integrado en pipelines de QA para interpretar el estado de la UI y validar que los flujos de la aplicacion se comportan como se espera, usando el proyector visual para leer la pantalla.
- Asistentes de accesibilidad en navegador: interpretacion de capturas de pantalla y generacion de instrucciones o resumenes de la pagina para usuarios con dificultades visuales, ejecutandose localmente sin enviar datos a la nube.
- Ejecucion en cliente con WebGPU: al distribuirse en GGUF y estar pensado para WebGPU, permite desplegar el agente directamente en el navegador del usuario, reduciendo costes de servidor y preservando la privacidad del contexto de navegacion.
- Extraccion de informacion de formularios y paginas: dado un screenshot y el DOM o texto de la pagina, el modelo puede identificar campos, valores y acciones disponibles para rellenar o procesar formularios de forma automatizada.
- Prototipado rapido de agentes multimodales: con `llama-server` y el `mmproj` en F16 se puede levantar un endpoint compatible con la API de OpenAI en local para experimentar con politicas de decision antes de escalar a modelos mayores.
- Clasificacion y enrutado de intenciones en flujos web: usar el modelo como componente ligero que decide que herramienta o subflujo activar a partir de una captura y una consulta, antes de delegar en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q4_K_M, 1,8 GB con Q8_0 y 3,3 GB con BF16, a los que hay que sumar 362 MB del proyector visual F16 y el espacio de contexto/KV cache.
- Cabe en GPU consumer: si, en cualquier GPU con 4 GB o mas de VRAM para Q4_K_M; 6 GB o mas para Q8_0; 8 GB o mas para BF16 con contexto moderado.
- GPU recomendadas: RTX 3060/4060 y superiores para uso local; A100/H100 no son necesarias dado el tamano del modelo, pero pueden usarse para servir muchas instancias concurrentes.
- Opciones de despliegue: `llama.cpp` (`llama-server` con `--mmproj`), y ejecucion en navegador via WebGPU segun la model card. vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| webbrain-compass-vld-v6-2b (este) | ~1,7B | no disponible (ejemplo con 16384) | Si (image-text-to-text) | lfm1.0 | GGUF |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de la misma categoria, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones de robustez; no hay garantias sobre el comportamiento en dominios fuera del entorno de navegador.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano; en tareas de decision de agente conviene validar las acciones propuestas antes de ejecutarlas.
- No se especifican los idiomas soportados, por lo que el rendimiento fuera del ingles (u otros idiomas no documentados) es incierto.
- La licencia `lfm1.0` (etiquetada como `other` en Hugging Face) puede imponer restricciones al uso comercial; es necesario revisar los terminos completos antes de desplegar en produccion.
- El modelo base es de ~1,7B parametros: su capacidad de razonamiento complejo y de contexto largo es limitada en comparacion con modelos de mayor tamano.
- El contexto maximo real no esta documentado; el valor de 16384 en el ejemplo de `llama-server` es una configuracion de despliegue, no necesariamente el maximo entrenado.
- El flag `--reasoning off` sugiere modos de razonamiento opcionales cuyo comportamiento y calidad no estan documentados.
- No hay informacion sobre tool calling nativo ni sobre formatos de function calling, lo que puede limitar su integracion en pipelines de agentes que dependan de esa funcionalidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/webbrain-one/webbrain-compass-vld-v6-2b-gguf
- Modelo base: https://huggingface.co/webbrain-one/webbrain-compass-vld-v6-2b
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
