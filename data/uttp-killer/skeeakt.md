# UTTP-killer/SkeeAkt

## Resumen

SkeeAkt es un modelo publicado en Hugging Face por el usuario UTTP-killer bajo el identificador `UTTP-killer/SkeeAkt`, con pipeline declarado `text-to-3d`. Se presenta como un fine-tune (o derivado) del modelo base `meshy-ai-team/seamflow`, un modelo de generacion de mallas 3D a partir de texto, y referencia tambien como base secundaria una cuantizacion GGUF de Gemma 3 4B VL, lo que sugiere un posible componente multimodal o de procesamiento de lenguaje en el pipeline. La model card publicada es practicamente vacia: solo incluye metadatos YAML de licencia, idiomas y modelos base, sin descripcion tecnica, datos de entrenamiento ni resultados.

El modelo no cuenta con descargas ni likes en el momento de la consulta (0 descargas, 0 likes) y fue creado el 3 de noviembre de 2026, con una unica actualizacion minutos despues. Esto indica que se trata de una publicacion reciente y sin validacion por parte de la comunidad. La ausencia de documentacion tecnica hace imposible verificar arquitectura, tamano, contexto o calidad de generacion.

Por tanto, esta ficha se limita a reflejar los metadatos disponibles y marca explicitamente como "no disponible" cualquier dato que el autor no haya publicado. No debe interpretarse como una recomendacion de uso: la falta de informacion y de benchmarks impide evaluar su idoneidad para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base declarado: meshy-ai-team/seamflow) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr, de, it, es, nl, ru, pt, pl, lt, uk, hu, cs, ko, ja, zh |
| Licencia | cc-by-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card. El autor declara como modelo base `meshy-ai-team/seamflow`, lo que situa a SkeeAkt en la familia de modelos de generacion de mallas 3D a partir de texto (text-to-3D). Adicionalmente se referencia `mradermacher/Gemma-3-4B-VL-it-Gemini-Pro-Heretic-Uncensored-Thinking-GGUF`, una cuantizacion GGUF de un fine-tune de Gemma 3 4B VL, lo que podria indicar el uso de un componente de lenguaje/vision en el pipeline, pero el autor no detalla como se combinan ambos modelos ni si se trata de un ensemble, un adaptador o una destilacion.

No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.). Toda esta seccion queda como no disponible.

## Capacidades

- Generacion de contenido 3D a partir de texto (pipeline declarado `text-to-3d`).
- Soporte multilingue declarado para 16 idiomas (en, fr, de, it, es, nl, ru, pt, pl, lt, uk, hu, cs, ko, ja, zh).
- Posible componente de vision/lenguaje por la referencia a Gemma 3 4B VL, sin confirmar por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Prototipado de assets 3D para videojuegos: generar mallas base a partir de descripciones textuales para iterar rapidamente en fases de preproduccion, siempre que se valide la calidad de la malla generada.
- Previsualizacion de conceptos en diseno de producto: obtener borradores 3D de objetos descritos en lenguaje natural para discutir variantes con el equipo de diseno.
- Generacion de contenido para escenas de RV/AR: crear geometria de relleno para entornos inmersivos donde no se requiere precision industrial.
- Educacion y demostraciones: ilustrar conceptos en 3D a partir de texto en entornos academicos, con revision humana posterior.
- Pipelines de contenido multilingue: aprovechar el soporte declarado de 16 idiomas para generar assets a partir de prompts en distintos idiomas.
- Investigacion en text-to-3D: servir como punto de partida para experimentos de fine-tuning sobre `seamflow`, dado que el autor lo publica como derivado.

En todos los casos, la ausencia de benchmarks y de documentacion obliga a validar el modelo en el dominio concreto antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano del modelo base, no declarado).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.): no disponible; al ser un pipeline text-to-3D, requeriria herramientas especificas de generacion de mallas no detalladas por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SkeeAkt (UTTP-killer) | no disponible | no disponible | cc-by-2.0 | Hugging Face, 0 descargas | Fine-tune de seamflow, sin documentacion |
| meshy-ai-team/seamflow | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Modelo base declarado por el autor |
| Gemma-3-4B-VL-it-Gemini-Pro-Heretic-Uncensored-Thinking-GGUF | 4B (Gemma 3 4B VL) | no disponible | no disponible | Hugging Face (mradermacher) | Referenciado como base secundaria, cuantizado GGUF |

No se dispone de datos suficientes para comparar rendimiento, contexto o calidad con alternativas de la misma categoria.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay descripcion tecnica, datos de entrenamiento ni evaluacion.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Riesgo elevado de alucinacion y de geometrias incorrectas al no existir benchmarks de calidad 3D.
- Idiomas declarados sin evidencia de evaluacion real por idioma.
- Licencia cc-by-2.0: permite uso comercial con atribucion, pero conviene verificar la licencia del modelo base `seamflow` y de Gemma 3 4B VL, que pueden imponer restricciones adicionales.
- La referencia a un fine-tune "uncensored" de Gemma como base secundaria plantea dudas sobre filtros de seguridad y contenido generado.
- No apto para produccion sin una evaluacion independiente previa.

## Enlaces

- Hugging Face: https://huggingface.co/UTTP-killer/SkeeAkt
- Modelo base declarado: https://huggingface.co/meshy-ai-team/seamflow
- Base secundaria referenciada: https://huggingface.co/mradermacher/Gemma-3-4B-VL-it-Gemini-Pro-Heretic-Uncensored-Thinking-GGUF
