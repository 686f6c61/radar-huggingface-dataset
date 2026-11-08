# yusuklee/Crystal

## Resumen

Crystal es un repositorio publicado en Hugging Face por el usuario yusuklee que no contiene un modelo de lenguaje entrenado, sino el código de una demostración de recomendación de noticias explicativa basada en veracidad. Según la model card, se trata de una variante de PRISM (demo presentada en CIKM'26) en la que el eje de orientación política se sustituye por un eje de veracidad frente a desinformación. El repositorio empaqueta un pipeline completo de verificación y recomendación, no pesos de un transformer propio.

El sistema combina varias piezas: verificación de hechos mediante la API Google Fact Check Tools y un clasificador RoBERTa con validación cruzada de 10 folds (predicciones out-of-fold con temperature scaling), extracción de palabras clave justificativas mediante Integrated Gradients y expansión sintáctica con spaCy, agrupación de noticias sobre el mismo suceso con SBERT (all-MiniLM-L6-v2) y HDBSCAN con umbral de coseno de 0,7 dentro del clúster, y recomendación con CROWN (crown-www25). La generación de las frases explicativas se delega en Gemini, que actúa únicamente como verbalizador.

Es relevante ahora porque ilustra un patrón de sistema compuesto (retrieval, clasificación, clustering y un LLM como capa de verbalización) para un problema candente como es la recomendación de noticias con trazabilidad de veracidad. No obstante, la información pública es muy escasa: el repositorio no incluye datos ni pesos, no declara licencia, idiomas ni pipeline, y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: RoBERTa (clasificador de veracidad), SBERT all-MiniLM-L6-v2 (embeddings), HDBSCAN (clustering), CROWN (recomendador), Gemini (verbalizador) |
| Parametros totales | no disponible (no se publican pesos propios; depende de los modelos de terceros integrados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta redactada en coreano y el pipeline usa spaCy y una API de fact checking, lo que sugiere orientacion a ingles/coreano, sin confirmacion) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos no se incluyen en el repositorio; solo codigo y pipeline) |

## Arquitectura y entrenamiento

No se trata de un transformer monolítico sino de una arquitectura de sistema con cinco etapas encadenadas. La verificación de veracidad combina una fuente externa (Google Fact Check Tools API) con un clasificador RoBERTa entrenado mediante validación cruzada de 10 folds; las predicciones usadas en la demo son out-of-fold y se calibran con temperature scaling, lo que evita fuga de información entre entrenamiento y evaluación. La justificación del veredicto se obtiene con Integrated Gradients sobre el clasificador y se expande a nivel de frase con dependencias de spaCy.

La agrupación de noticias que cubren el mismo suceso se realiza con embeddings de SBERT (all-MiniLM-L6-v2) seguidos de HDBSCAN, aceptando como mismo evento los pares con similitud coseno igual o superior a 0,7 dentro del clúster. La recomendación se delega en CROWN (variante crown-www25). Finalmente, Gemini se usa solo como verbalizador de las explicaciones, no como componente de decisión. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Verificación de veracidad de afirmaciones y noticias mediante combinación de API de fact checking y clasificador RoBERTa calibrado.
- Extracción de palabras clave y fragmentos justificativos del veredicto mediante Integrated Gradients y expansión sintáctica con spaCy.
- Detección y agrupación de noticias que cubren el mismo suceso mediante embeddings SBERT y clustering HDBSCAN con umbral de coseno de 0,7.
- Recomendación de noticias personalizada o contextualizada mediante el recomendador CROWN.
- Generación de explicaciones en lenguaje natural de las recomendaciones, delegada en Gemini como verbalizador.
- Despliegue como servicio web mediante FastAPI y Uvicorn en el puerto 8765, con opción de contenedor Docker.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo thinking propias del repositorio.

## Casos de uso

- Prototipo de verificación de noticias en redacción: el pipeline consulta la API de Fact Check Tools y aplica el clasificador RoBERTa para asignar un veredicto de veracidad a cada pieza antes de su publicación, con palabras clave que justifican la decisión.
- Agrupación de coberturas de un mismo suceso: usando SBERT y HDBSCAN con umbral de coseno de 0,7, un medio puede detectar automáticamente qué artículos de distintas fuentes cubren el mismo evento y compararlos.
- Recomendación de noticias con trazabilidad: CROWN genera las recomendaciones y Gemini produce la explicación en lenguaje natural, de modo que el usuario entiende por qué se le sugiere una noticia concreta.
- Investigación académica sobre sistemas explicativos: sirve como referencia reproducible (código y pipeline descritos) para estudiar la sustitución del eje político de PRISM por un eje de veracidad.
- Demo docente o de divulgación: el despliegue con Docker y una única variable de entorno (GEMINI_API_KEY) permite levantar la aplicación en un taller o clase sin infraestructura compleja.
- Auditoría interna de desinformación: el clasificador calibrado con temperature scaling y las predicciones out-of-fold permiten estimar la fiabilidad del veredicto antes de integrarlo en un flujo editorial.
- Base para experimentación con verbalizadores: al aislar Gemini como capa de verbalización, es posible sustituirlo por otro LLM y comparar la calidad de las explicaciones sin tocar el resto del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible; el sistema depende de modelos de terceros (RoBERTa, all-MiniLM-L6-v2, CROWN y Gemini vía API), por lo que el consumo real vendrá determinado por esos componentes.
- El clasificador RoBERTa y el modelo SBERT all-MiniLM-L6-v2 son de tamaño moderado y pueden ejecutarse en GPU de consumo, aunque no se confirma en la documentación.
- Gemini se consume como API externa mediante GEMINI_API_KEY, por lo que no requiere GPU local para la verbalización.
- Despliegue documentado: FastAPI con Uvicorn (`python -X utf8 -m uvicorn crystal.web.app:app --port 8765`) y Docker (`docker build -t crystal .` y `docker run -p 8765:8765 -e GEMINI_API_KEY=... crystal`).
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ni latencias o throughput estimados.

## Comparativa con modelos similares

| Sistema | Enfoque | Componentes | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crystal | Recomendación de noticias por veracidad | RoBERTa, SBERT, HDBSCAN, CROWN, Gemini | no disponible | no disponible | Código en HF y GitHub; sin pesos ni datos |
| PRISM (CIKM'26 demo) | Recomendación de noticias por orientación política | no disponible en la información | no disponible | no disponible | Referenciado como base de Crystal |
| CROWN (crown-www25) | Recomendador de noticias | no disponible | no disponible | no disponible | Usado como componente de Crystal |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no incluye los datos (`crystal/data/*.jsonl`) ni los pesos; sin los artefactos del pipeline la aplicación no es funcional tal cual.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- No se declaran idiomas soportados; la model card está en coreano y el pipeline usa spaCy y una API de fact checking, lo que puede limitar su aplicación a otros idiomas.
- La verificación de veracidad depende de la API Google Fact Check Tools y de un clasificador RoBERTa entrenado sobre datos no documentados; existe riesgo de falsos positivos y negativos, y de sesgo heredado de las fuentes de fact checking.
- La calidad de las explicaciones depende de Gemini como verbalizador externo, lo que introduce dependencia de una API de terceros, coste por uso y posible alucinación en el texto explicativo.
- El agrupamiento por mismo suceso usa un umbral fijo de coseno de 0,7, que puede fusionar eventos distintos o separar coberturas del mismo evento en dominios muy especializados.
- No hay benchmarks publicados que permitan estimar el rendimiento real en producción.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/yusuklee/Crystal
- Perfil del autor en Hugging Face: https://huggingface.co/yusuklee
- Repositorio GitHub: https://github.com/yusuklee/Crystal
