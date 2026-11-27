# zwpro/UniFit

## Resumen

UniFit es un modelo de prueba virtual (virtual try-on) desarrollado por el autor zwpro (repositorio YeyingLab en GitHub) y presentado en AAAI 2026. Resuelve el problema de transferir una prenda de vestir sobre una persona manteniendo coherencia semantica entre la ropa y el cuerpo, apoyandose en un modelo multimodal de lenguaje (MLLM) como guia de alineamiento semantico. El nombre completo del trabajo es "UniFit: Towards Universal Virtual Try-on with MLLM-Guided Semantic Alignment".

El modelo se distribuye como un checkpoint de difusion en formato safetensors con 179.306.496 parametros (aproximadamente 179 millones) y un repositorio de 5,4 GB, lo que sugiere pesos en precision alta (fp32/bf16) junto con posibles componentes auxiliares. Se publica bajo la libreria `unifit` y la etiqueta `diffusers`, lo que indica un pipeline de generacion de imagenes condicionado.

Es relevante ahora porque aborda la "universalidad" del try-on: no solo prendas superiores en poses frontales, sino una alineacion semantica guiada por MLLM que pretende generalizar a categorias de ropa y contextos mas variados. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su adopcion practica aun esta por validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion condicionado con guia de alineamiento semantico mediante MLLM (detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 179.306.496 (~179 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que UniFit es un modelo de difusion para virtual try-on que incorpora un MLLM como mecanismo de alineamiento semantico. El planteamiento del paper (AAAI 2026, arXiv 2511.15831) es usar el MLLM para interpretar la relacion entre la prenda y la persona, de modo que la generacion de la imagen final respete la semantica de la ropa (categoria, textura, estructura) y la anatomia del sujeto. No se dispone de detalles sobre el backbone de difusion concreto, el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO.

Tampoco se han publicado en la informacion proporcionada datos sobre innovaciones adicionales (decodificacion especulativa, atencion lineal, destilacion). El tamano del checkpoint (179 M de parametros) es notablemente reducido para un sistema de difusion completo, lo que sugiere que podria tratarse de un modulo especifico (por ejemplo, adaptadores o un componente de alineamiento) y no del generador completo; este punto no puede confirmarse con los datos disponibles.

## Capacidades

- Generacion de imagenes de prueba virtual: superpone una prenda sobre una imagen de persona.
- Alineamiento semantico guiado por MLLM entre prenda y cuerpo.
- Orientado a categorias de ropa variadas segun el enfoque "universal" del paper.
- No se dispone de informacion sobre soporte de tool calling, function calling ni agentes.
- No se dispone de informacion sobre capacidades multilingues.
- No se dispone de informacion sobre modos especiales (thinking, vision general, audio).

## Casos de uso

- Comercio electronico de moda: generar vistas previas de como queda una prenda concreta sobre el comprador o sobre un modelo, reduciendo devoluciones por talla o expectativa visual. El alineamiento semantico del MLLM ayuda a preservar la estructura de la prenda.
- Catalogos automatizados: producir imagenes de producto sobre modelos virtuales en multiples poses y prendas sin sesion fotografica, usando el checkpoint como componente del pipeline de generacion.
- Probadores virtuales en aplicaciones moviles: integrar el modelo en un backend de inferencia que reciba foto del usuario y foto de la prenda y devuelva la composicion.
- Diseno y previsualizacion de colecciones: permitir a disenadores comprobar como se comporta un patron o tejido sobre cuerpos distintos antes de fabricar la muestra fisica.
- Marketing y redes sociales: generar variantes de una misma prenda sobre distintos sujetos para campanas segmentadas.
- Investigacion en generacion condicionada: servir como baseline reproducible (pesos publicos en safetensors) para experimentos de alineamiento semantico con MLLM en tareas de imagen a imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. El repositorio ocupa 5,4 GB, por lo que cargar los pesos completos requiere al menos ese orden de magnitud de memoria, mas el coste del resto del pipeline de difusion y del MLLM guia.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del repo, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB) seria un punto de partida razonable, pero no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: probablemente viable en GPUs de gama alta con suficiente VRAM, sin dato confirmado.
- Opciones de despliegue: la libreria declarada es `unifit` y la etiqueta `diffusers`; no se detallan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables directamente a este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de virtual try-on.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no puede asumirse uso comercial sin consultar al autor.
- Modelo con 0 descargas y 0 likes: sin validacion externa de la comunidad.
- No hay model card detallada: se desconoce el dataset de entrenamiento, los sesgos y los dominios cubiertos.
- Riesgo de artefactos propios de la difusion (deformaciones de tejido, manos, proporciones corporales) no cuantificado.
- La dependencia de un MLLM guia implica un coste computacional adicional en inferencia no documentado.
- No hay informacion sobre idiomas ni sobre sesgos demograficos en la generacion de cuerpos.
- El reducido numero de parametros (179 M) hace dudoso que el checkpoint contenga el generador completo; verificar la composicion del repo antes de integrarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/zwpro/UniFit
- arXiv: https://arxiv.org/abs/2511.15831
- Paper AAAI 2026: https://ojs.aaai.org/index.php/AAAI/article/view/38279
- Codigo: https://github.com/YeyingLab/UniFit
