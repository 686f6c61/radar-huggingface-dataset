# zehen8716/zehen-lora

## Resumen

zehen8716/zehen-lora es un adaptador LoRA (Low-Rank Adaptation) de personalización para el modelo de difusión Krea 2, desarrollado por el usuario zehen8716. Se trata de un ajuste fino tipo DreamBooth entrenado sobre el checkpoint Krea-2-Raw, el cual permite generar imágenes de un sujeto concreto (una persona femenina) mediante el prompt desencadenante «zehen woman». La relevancia de este tipo de adaptadores radica en que permiten personalizar un modelo base de difusión sin necesidad de reentrenarlo completo, reduciendo drásticamente el coste computacional y el tiempo de ajuste.

El modelo está diseñado para funcionar con el ecosistema de Diffusers, y sigue la práctica recomendada por Krea 2 de entrenar sobre la versión RAW y ejecutar la inferencia sobre la versión Turbo, que es un checkpoint destilado de 8 pasos para una generación rápida. El repositorio contiene únicamente los pesos del LoRA (1,3 GB en formato safetensors) y no el modelo base completo, por lo que es un complemento que debe cargarse sobre Krea-2-Turbo o Krea-2-Raw. Su licencia Apache 2.0 permite uso comercial sin restricciones de atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo de difusión Krea 2 (RAW/Turbo) |
| Parametros totales | No disponible (el repositorio contiene el adaptador, no los pesos completos del modelo base) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo texto-imagen, no procesamiento de texto secuencial) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors, sin cuantizacion documentada) |
| Idiomas soportados | No disponibles (la model card no especifica idiomas; se asume ingles por defecto en prompts) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante la tecnica DreamBooth, un metodo de fine-tuning que permite personalizar un modelo de difusion para generar un sujeto o concepto especifico a partir de unas pocas imagenes de referencia. El entrenamiento se realiza sobre el checkpoint Krea-2-Raw, que es la version no destilada del modelo base, disenada para servir como punto de partida en tareas de ajuste fino. Krea 2, el modelo base, es un modelo de difusion texto-imagen de la familia Krea, que ofrece dos variantes: RAW (base no destilada) y Turbo (checkpoint destilado en 8 pasos para inferencia rapida). La practica recomendada es entrenar el LoRA sobre RAW y aplicarlo sobre Turbo, ya que los pesos entrenados en RAW se expresan correctamente en la version destilada.

No se dispone de informacion detallada sobre el dataset de entrenamiento utilizado (numero de imagenes, composicion, etc.) ni sobre el proceso de entrenamiento exacto (numero de pasos, tasa de aprendizaje, etc.). La model card indica que el entrenamiento se realizo con el script de DreamBooth del repositorio de diffusers para Krea 2, pero no aporta metricas ni hiperparametros.

## Capacidades

- Generacion de imagenes de un sujeto especifico (una mujer con el trigger «zehen woman») en el estilo y composicion que se indique en el prompt.
- Compatibilidad con el pipeline de Diffusers, lo que permite integracion en flujos de trabajo de generacion de imagenes existentes.
- Soporte para el uso sobre Krea-2-Turbo, que requiere solo 8 pasos de inferencia y no usa clasificador sin guia (guidance scale = 0.0), lo que acelera la generacion.
- Posibilidad de combinacion, mezcla y fusion de LoRAs mediante las utilidades de carga de adaptadores de diffusers, lo que permite crear variaciones o estilos combinados.
- No se documentan capacidades adicionales como tool calling, agentes o soporte multimodal; se trata de un adaptador de generacion de imagenes puro.

## Casos de uso

- **Avatares personalizados para redes sociales**: se puede generar un avatar de una persona concreta (la del trigger «zeena woman») en multiples estilos, fondos y poses, simplemente variando el prompt. Al cargar el LoRA sobre Krea-2-Turbo con 8 pasos, se obtienen resultados rapidos, adecuados para iterar sobre diseños.
- **Creacion de contenido de marketing**: para marcas que necesitan representaciones consistentes de una modelo en campanas publicitarias, el LoRA permite generar una serie de imagenes con la misma persona en diferentes contextos sin necesidad de sesiones fotograficas adicionales.
- **Desarrollo de personajes en videojuegos**: un disenador puede usar el LoRA para generar multiples vistas de un personaje femenino, manteniendo la identidad visual del mismo, lo que facilita la exploracion de conceptos de arte.
- **Prototipado de diseno de moda**: el adaptador puede generar una prenda sobre el cuerpo de la persona del trigger, permitiendo a disenadores visualizar como quedaria una prenda especifica sin sesion de fotos.
- **Ilustracion de libros o comics**: para un ilustrador que necesita una representacion consistente de un personaje femenino a lo largo de una historia, el LoRA ofrece una base solida para mantener la apariencia en diferentes escenas.
- **Pruebas de maquillaje o peluqueria**: se puede generar la misma persona con diferentes estilos de maquillaje o peinados, facilitando la decision de un look antes de aplicarlo en la realidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye comparaciones con otros modelos ni metricas de calidad (como FID, CLIP score, etc.). Tampoco se reportan datos de rendimiento especificos del LoRA (tiempo de generacion, VRAM consumida, etc.).

## Requisitos de hardware

- No se especifican requisitos de VRAM para el adaptador en la informacion proporcionada. Dado que el LoRA se carga sobre el modelo base Krea-2-Turbo, los requisitos seran los del modelo base: para Krea-2-Turbo, se recomienda al menos 8 GB de VRAM para una resolucion tipica de 512x512 o 768x768, aunque puede requerirse mas para resoluciones superiores.
- GPU recomendadas: cualquier GPU con soporte de CUDA y suficiente VRAM, por ejemplo RTX 3060 (12 GB), RTX 4090 (24 GB) o A100 (40/80 GB) para resoluciones altas o uso en produccion.
- Si cabe en una GPU de consumo: si, con al menos 8 GB de VRAM se puede ejecutar en una RTX 3060 o superior.
- Opciones de despliegue: el modelo se integra con el pipeline de diffusers, por lo que se puede ejecutar con el SDK de diffusers en Python. Tambien es compatible con herramientas que soporten cargas de LoRA de diffusers, como los servidores de generacion de imagenes que usan la libreria. No se menciona soporte para vLLM, llama.cpp o Ollama, ya que son sistemas para modelos de lenguaje, no para difusion.
- Latencia y throughput: no se reportan datos. Con Krea-2-Turbo y 8 pasos, se espera una generacion rapida, en el orden de segundos en una GPU moderna, pero no hay una cifra exacta.

## Comparativa con modelos similares

No se dispone de informacion para realizar una comparativa directa con otros modelos. El mismo autor ha publicado otros LoRAs (por ejemplo, zehen8716/ritika-lora y zehen8716/kashish-lora) que siguen el mismo patron de entrenamiento sobre Krea-2-Raw, pero no se proporcionan datos de rendimiento o calidad que permitan una comparativa objetiva. En el ecosistema de LoRAs para modelos de difusion, existen alternativas como los LoRAs de Stable Diffusion XL o Flux, pero no hay datos que permitan una comparativa cuantitativa con este adaptador.

## Limitaciones y advertencias

- **Sesgos y representacion**: el LoRA fue entrenado para un sujeto especifico (una mujer con el trigger «zeena woman»), por lo que su uso se limita a generar esa persona concreta. No es un modelo generalista y no se recomienda para generar otras personas o sujetos sin reentrenamiento.
- **Riesgo de alucinacion**: como todo modelo de difusion, puede generar imagenes que no coincidan con la realidad del sujeto, especialmente si el prompt es complejo o ambiguo. Se recomienda una revision manual de las imagenes generadas.
- **Limitaciones de contexto**: al ser un adaptador de texto-imagen, no tiene capacidad de mantener contexto a lo largo de multiples turnos ni de procesar texto extenso; el prompt es una unica entrada.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo base Krea-2 tiene su propia licencia (no especificada en la informacion proporcionada). Es responsabilidad del usuario verificar los terminos del modelo base antes de usar el LoRA en produccion.
- **Caveat de produccion**: el LoRA no incluye el modelo base; es necesario descargar Krea-2-Turbo o Krea-2-Raw por separado. Ademas, la model card no documenta el dataset de entrenamiento, lo que limita la transparencia sobre la procedencia de las imagenes y posibles derechos de los sujetos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zehen8716/zehen-lora
- Pagina del autor en HuggingFace: https://huggingface.co/zehen8716
- Documentacion de carga de LoRAs en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Guia de entrenamiento DreamBooth para Krea 2: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Otros LoRAs del mismo autor: https://huggingface.co/zehen8716/ritika-lora y https://huggingface.co/zehen8716/kashish-lora
