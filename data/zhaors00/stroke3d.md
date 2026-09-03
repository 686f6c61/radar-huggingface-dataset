# zhaors00/Stroke3D

## Resumen

Stroke3D es un modelo de difusión latente desarrollado por un equipo de investigación (Zhao, Zheng, Yang, Fan y Yang) presentado en ICLR 2026. Su objetivo es transformar trazos 2D (dibujos o bocetos) en modelos 3D riggeados, es decir, modelos tridimensionales con una estructura de esqueleto y articulaciones lista para animación. El modelo se basa en una arquitectura de difusión latente con ControlNet, e incorpora una etapa de optimización por preferencias (SKA-DPO) para mejorar la calidad de los resultados.

El repositorio de HuggingFace no contiene un pipeline completo de Diffusers, sino los pesos del ControlNet entrenado (subcarpeta `skdream-ska-dpo`), junto con datos de entrenamiento y metadatos. El tamaño total del repositorio es de 37,6 GB, lo que sugiere que los pesos son considerables, aunque no se especifica el número de parámetros. El modelo está pensado para ser usado con el código oficial del proyecto, no como una solución autónoma.

La relevancia de Stroke3D radica en que aborda un problema poco explorado: la generación de modelos 3D animables a partir de bocetos 2D, un flujo de trabajo habitual en diseño de personajes, concept art y prototipado. Al integrar ControlNet y optimización por preferencias, busca ofrecer un control más preciso y resultados más alineados con la intención del usuario que los métodos anteriores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente con ControlNet (SKDream/SKA-DPO) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sin licencia explícita sobre los checkpoints) |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo se describe como un sistema de difusión latente que "eleva" trazos 2D a modelos 3D riggeados. La arquitectura combina un modelo de difusión base con una red ControlNet, que condiciona la generación a partir de los trazos de entrada. El entrenamiento incluye una fase de optimización por preferencias denominada SKA-DPO, que ajusta los pesos para que los resultados sean más preferibles según un criterio de calidad (probablemente evaluado por humanos o métricas automáticas). No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso exacto de entrenamiento. El repositorio incluye un archivo de datos de entrenamiento con 2.000 pares para la fase SKA-DPO y un conjunto de 6.633 pares skeleton/GLB con anotaciones de texto para la etapa de texturizado.

## Capacidades

- Generación de modelos 3D riggeados a partir de trazos 2D (bocetos o dibujos).
- Generación multi-vista: el modelo produce múltiples vistas del objeto 3D, lo que facilita la reconstrucción completa.
- Condicionamiento mediante ControlNet, lo que permite un control fino sobre la forma generada.
- Optimización por preferencias (SKA-DPO) para mejorar la calidad percibida de los resultados.
- No se mencionan capacidades de texto, tool calling, agentes ni otros dominios.

## Casos de uso

- Diseño de personajes para animación: un artista dibuja un boceto 2D de un personaje y Stroke3D genera un modelo 3D riggeado listo para ser animado en software como Blender o Maya. El flujo acelera la fase de modelado inicial.
- Prototipado rápido en desarrollo de videojuegos: los diseñadores pueden esbozar conceptos y obtener modelos 3D preliminares para evaluar la viabilidad antes de invertir en modelado detallado.
- Creación de assets para realidad virtual y aumentada: a partir de dibujos simples, se pueden generar objetos 3D interactivos para entornos inmersivos.
- Educación y formación en modelado 3D: los estudiantes pueden practicar la interpretación de bocetos y comparar sus propias creaciones con las generadas por el modelo.
- Generación de variantes de diseño: modificando los trazos de entrada, se pueden explorar rápidamente diferentes formas y posturas de un mismo objeto o personaje.
- Integración en pipelines de producción de contenido: el modelo puede usarse como paso intermedio entre el concept art y el modelado final, reduciendo el tiempo de producción en estudios de animación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de ICLR 2026 podría incluir métricas, pero no se proporcionan en el modelo card ni en los resultados de búsqueda.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPUs recomendadas en la documentación disponible.
- Dado el tamaño del repositorio (37,6 GB) y que se trata de un modelo de difusión con ControlNet, es razonable esperar que la inferencia requiera una GPU con al menos 16-24 GB de VRAM, aunque esto es una estimación no confirmada.
- El modelo no es un pipeline de Diffusers estándar; se ejecuta mediante el script `infer_mv.py` del repositorio oficial, por lo que el despliegue requiere el código del proyecto.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- No se ha declarado una licencia explícita sobre los checkpoints ni sobre los datos derivados. Es necesario revisar los términos de los componentes individuales y las licencias de los modelos base antes de cualquier uso comercial o redistribución.
- El repositorio incluye archivos con metadatos en formato Python pickle. La carga de estos archivos solo debe realizarse desde fuentes de confianza, ya que el pickle puede ejecutar código arbitrario.
- El modelo no es un pipeline autónomo; requiere el código del proyecto Stroke3D para funcionar. No se puede cargar directamente con `diffusers` sin adaptaciones.
- No se especifican los idiomas soportados ni si el modelo tiene capacidades multilingües; probablemente se centra en la entrada visual (trazos) y no en texto.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de investigación, puede presentar limitaciones en la generalización a estilos de dibujo poco representados.
- El riesgo de alucinación o generación de geometrías incorrectas no se ha evaluado públicamente; se recomienda validar los resultados en aplicaciones de producción.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/zhaors00/Stroke3D
- Paper en OpenReview: https://openreview.net/forum?id=VgOWxor3LV
- Código en GitHub: https://github.com/Whalesong-zrs/Stroke3D
- Página del proyecto: https://whalesong-zrs.github.io/Stroke3D_project_page/
