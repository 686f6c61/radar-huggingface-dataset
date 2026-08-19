# stabilityai/stable-audio-3-medium

## Resumen

Stable Audio 3 Medium es un modelo de generación de audio de texto a audio desarrollado por Stability AI, la tercera generación de su familia Stable Audio. Está diseñado para producir música y efectos de sonido a partir de descripciones textuales, resolviendo el problema de la síntesis de audio de alta calidad sin necesidad de muestras de referencia. El modelo se distribuye con pesos abiertos bajo la licencia Stable Audio Community, aunque su acceso en HuggingFace es restringido y requiere aceptar condiciones.

Con 2.305.495.793 parámetros y un tamaño de repositorio de 10,4 GB, el modelo se presenta como una opción de tamaño medio dentro de la familia Stable Audio 3, que según Stability AI incluye tres modelos de pesos abiertos entrenados con datos totalmente licenciados. Está disponible a través de la librería `stable-audio-3`, que ofrece una plataforma simplificada para inferencia y fine-tuning, basada en las lecciones aprendidas de la anterior herramienta `stable-audio-tools`. Su relevancia actual radica en ofrecer una alternativa abierta y comercialmente viable para generación de audio profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión texto-audio) |
| Parametros totales | 2.305.495.793 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (según metadatos de HuggingFace) |
| Licencia | stable-audio-community (acceso restringido, requiere aceptación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los detalles arquitectónicos específicos de Stable Audio 3 Medium no se han publicado en la información disponible. Se sabe que pertenece a la categoría de modelos de difusión para generación de audio, dado su pipeline `text-to-audio` y los tags asociados (`diffusion`, `audio-generation`). El modelo base es `stabilityai/stable-audio-3-medium-base`, lo que sugiere una arquitectura que distingue entre un modelo base y un modelo fine-tuned para la generación final.

En cuanto al entrenamiento, Stability AI indica que la familia Stable Audio 3 se entrenó con datos totalmente licenciados, un aspecto relevante para el uso comercial. No se dispone de información sobre el número de tokens, composición del dataset o técnicas de alineación como RLHF o DPO. El repositorio GitHub oficial se centra en inferencia y fine-tuning, indicando que el modelo está diseñado para ser adaptado por la comunidad, pero no se ofrecen detalles técnicos adicionales sobre la arquitectura interna o el proceso de entrenamiento.

## Capacidades

- Generación de audio a partir de texto: el modelo puede producir música y efectos de sonido a partir de descripciones textuales, según su pipeline `text-to-audio`.
- Fine-tuning: al estar diseñado para inferencia y fine-tuning, permite adaptarse a dominios específicos de audio (por ejemplo, estilos musicales concretos o tipos de efectos sonoros).
- Generación con datos licenciados: el entrenamiento con datos totalmente licenciados facilita su uso en aplicaciones comerciales sin problemas de derechos de autor.
- Soporte de múltiples salidas de audio: aunque no se detallan las longitudes exactas, la familia Stable Audio ha soportado históricamente generación de clips de duración variable (típicamente hasta 95 segundos en versiones anteriores; este dato no está confirmado para la versión 3).
- No se ha confirmado soporte de tool calling, agentes, ni capacidades multimodales más allá de texto a audio.

## Casos de uso

- Producción musical automatizada: el modelo puede generar pistas musicales completas a partir de descripciones como "tema electrónico ambiental a 120 BPM con sintetizadores brillantes", útil para creadores que necesitan material base rápido.
- Diseño de sonido para videojuegos: permite generar efectos de sonido específicos (pasos, ambientaciones, impactos) a partir de texto, acelerando el flujo de trabajo de los diseñadores de audio.
- Generación de bandas sonoras para vídeo: los creadores de contenido pueden producir música de fondo personalizada sin depender de librerías de stock, gracias a la licencia de datos de entrenamiento.
- Prototipado de ideas musicales: compositores y productores pueden usar el modelo para explorar variaciones de una idea textual antes de desarrollarla manualmente.
- Fine-tuning para marcas o estilos específicos: mediante el repositorio oficial, un estudio puede ajustar el modelo con su propio catálogo de audio para generar contenido coherente con su identidad sonora.
- Educación y experimentación: investigadores y estudiantes pueden estudiar la generación de audio con difusión y experimentar con técnicas de fine-tuning en un modelo de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de calidad objetiva (como FAD, CLAP score, etc.) para este modelo.

## Requisitos de hardware

- El modelo tiene aproximadamente 2,3 mil millones de parámetros y un tamaño de repo de 10,4 GB, lo que implica que la inferencia requiere una GPU con al menos 12-16 GB de VRAM en precisión FP16 (estimación basada en el tamaño de los pesos; no se han publicado requisitos oficiales).
- GPU recomendadas: tarjetas de gama alta como RTX 3090, RTX 4090, A100 o H100, dependiendo de la velocidad de generación deseada.
- Es posible que quepa en GPUs de consumo como la RTX 4080 o 4090, pero no se ha confirmado oficialmente.
- Opciones de despliegue: la librería `stable-audio-3` proporciona una interfaz para inferencia; no se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que estas son específicas de modelos de lenguaje.
- La latencia y el throughput dependen fuertemente del hardware y de la longitud del audio generado; no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos de generación de audio de código abierto (como AudioLDM, MusicGen o Stable Audio 2). Los datos de rendimiento y arquitectura no están disponibles, por lo que cualquier comparación sería especulativa.

## Limitaciones y advertencias

- El acceso al modelo es restringido: requiere aceptar las condiciones de la licencia en HuggingFace, lo que puede limitar su uso en entornos automatizados o corporativos.
- La licencia `stable-audio-community` tiene términos específicos que deben revisarse antes de un uso comercial; aunque los datos de entrenamiento están licenciados, la licencia del modelo puede imponer restricciones adicionales.
- El modelo solo soporta inglés en los metadatos, lo que puede limitar la generación de audio a partir de descripciones en otros idiomas.
- No se han publicado detalles sobre sesgos, alucinaciones o artefactos en el audio generado; como todo modelo generativo, puede producir resultados inesperados o de baja calidad en ciertos prompts.
- La falta de información sobre la longitud máxima de audio generado y la ventana de contexto impide planificar casos de uso que requieran clips largos o continuos.
- El repositorio GitHub se describe como "enfocado y simplificado", lo que sugiere que algunas funcionalidades de la versión anterior (`stable-audio-tools`) pueden no estar disponibles.

## Enlaces

- HuggingFace: https://huggingface.co/stabilityai/stable-audio-3-medium
- Página oficial de Stable Audio 3.0: https://stability.ai/stable-audio
- Repositorio GitHub: https://github.com/Stability-AI/stable-audio-3
- README en GitHub: https://github.com/Stability-AI/stable-audio-3/blob/main/README.md
- README en HuggingFace: https://huggingface.co/stabilityai/stable-audio-3-medium/blob/main/README.md
