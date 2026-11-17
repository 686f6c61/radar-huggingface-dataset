# yusuklee/Crystal

## Resumen

Crystal es un proyecto de demostracion de recomendacion de noticias explicativa basada en veracidad, desarrollado por el usuario de Hugging Face yusuklee. Se presenta como una evolucion del sistema PRISM (demo en CIKM'26), sustituyendo el eje de orientacion politica por un eje de veracidad (deteccion de noticias falsas). No es un modelo fundacional entrenado desde cero, sino un sistema compuesto que orquesta varios componentes: un clasificador RoBERTa para el juicio de veracidad, un modelo SBERT para el emparejamiento de eventos, un recomendador CROWN y un verbalizador Gemini para generar explicaciones.

El repositorio contiene el codigo del pipeline (entrenamiento, inferencia, coloreado de evidencias, agrupacion de eventos, sistema de recomendacion y una interfaz web FastAPI), pero no incluye los datos ni los pesos de los modelos. La model card esta redactada en coreano y no proporciona especificaciones tecnicas del modelo en el sentido habitual (parametros, contexto, licencia), por lo que la mayor parte de la ficha debe marcarse como no disponible.

La relevancia actual del proyecto reside en su enfoque de explicabilidad: combina la prediccion de veracidad con una atribucion de evidencias a nivel de frase (estilo ContextCite) y con la generacion de explicaciones en lenguaje natural, ofreciendo un caso practico de sistema de noticias con trazabilidad de decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: clasificador RoBERTa (veracidad) + SBERT all-MiniLM-L6-v2 (similitud) + HDBSCAN (clustering) + CROWN (recomendacion) + Gemini flash-lite (verbalizacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta en coreano; el dataset GossipCop es en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos no se incluyen en el repositorio) |

## Arquitectura y entrenamiento

Crystal no es un unico modelo de lenguaje, sino una arquitectura de sistema en capas. El componente central de clasificacion es un RoBERTa afinado para la tarea de veracidad, entrenado mediante validacion cruzada de 10 folds con predicciones out-of-fold y calibracion de temperatura. El autor reporta sobre el dataset GossipCop (17.527 ejemplos) una exactitud de 0,8725 y un F1 para la clase "fake" de 0,7319. Existe ademas una variante entrenada con enmascaramiento de nombres de personas (`train_masked.py`).

El resto del pipeline se apoya en componentes preentrenados: SBERT (all-MiniLM-L6-v2) para calcular similitud entre articulos, HDBSCAN para agrupar noticias del mismo evento con un umbral de coseno >= 0,7 dentro del cluster, y el recomendador CROWN (crown-www25). La atribucion de evidencias se realiza mediante una implementacion propia del metodo ContextCite (contribucion por frase), complementada con un diccionario de palabras senal definido manualmente; IG y LIME se usan solo para validar candidatos de senales. Las explicaciones en lenguaje natural se generan con Gemini (gemini-3.5-flash-lite) en rol de verbalizador, con cache prioritaria. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion de veracidad de noticias (fake/real) mediante RoBERTa afinado, con probabilidades calibradas por temperatura.
- Atribucion de evidencias a nivel de frase y palabra sobre el texto de la noticia (metodo tipo ContextCite mas diccionario de senales).
- Agrupacion de articulos que cubren el mismo evento (SBERT + HDBSCAN) y emparejamiento de noticias con veracidad opuesta.
- Recomendacion de noticias personalizada mediante CROWN, con feed y distribucion de veracidad.
- Generacion de explicaciones en lenguaje natural mediante Gemini flash-lite, con sistema de cache.
- Interfaz web (FastAPI) con vistas de feed, articulo y comparacion.
- Despliegue mediante Docker (`yusuklee/crystal:latest`).
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Verificacion asistida de noticias: el clasificador RoBERTa permite puntuar la veracidad de un articulo con probabilidades calibradas, util como primera senal en redacciones o herramientas de fact-checking.
- Explicabilidad de decisiones de moderacion: el coloreado por contribucion de frases permite mostrar al usuario que fragmentos del texto sustentan la clasificacion, lo que facilita la auditoria y la confianza en el sistema.
- Agrupacion de cobertura mediatica: SBERT + HDBSCAN agrupa articulos del mismo evento con umbral de coseno >= 0,7, lo que sirve para construir vistas comparadas de como distintos medios cubren un mismo hecho.
- Deteccion de narrativas contrapuestas: el emparejamiento de noticias del mismo evento con veracidad opuesta (`crystal/event/`) permite destacar desinformacion frente a cobertura verificada en un mismo tema.
- Recomendacion de noticias con senal de veracidad: CROWN permite generar feeds personalizados incorporando la distribucion de veracidad como criterio, util en prototipos de agregadores con prioridad de calidad informativa.
- Investigacion sobre explicabilidad en NLP: el codigo de entrenamiento (folds, enmascaramiento de nombres) y el pipeline de atribucion sirven como base reproducible para experimentos de atribucion de evidencias.
- Demo educativa o de divulgacion: la interfaz FastAPI y la imagen Docker permiten desplegar una demo funcional del sistema completo con un solo comando.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Resultado |
|---|---|---|---|
| Clasificacion de veracidad (RoBERTa, 10-fold OOF) | GossipCop (17.527 ejemplos) | Accuracy | 0,8725 |
| Clasificacion de veracidad (RoBERTa, 10-fold OOF) | GossipCop (17.527 ejemplos) | F1 (clase fake) | 0,7319 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor menciona un intento de usar la API Google Fact Check Tools que no llego a integrarse en la demo: solo el 24,3% de 597 casos de PolitiFact obtuvieron coincidencia y sin justificacion del veredicto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Por los componentes implicados (RoBERTa, all-MiniLM-L6-v2), la inferencia de los modelos de clasificacion y similitud es ligera y cabe en GPU consumer; el requisito dominante es el recomendador CROWN y cualquier componente adicional del pipeline.
- GPU recomendadas: no disponible. Para los componentes transformer (RoBERTa, MiniLM) basta una GPU consumer moderna; CROWN puede requerir mas memoria segun su implementacion.
- Cabe en GPU consumer: previsiblemente si para los componentes de clasificacion y similitud; no confirmado para el pipeline completo.
- Opciones de despliegue: Docker (`docker pull yusuklee/crystal:latest`), servidor FastAPI via uvicorn en el puerto 8765. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos suficientes de parametros, contexto o rendimiento para establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no incluye los datos (`crystal/data/*.jsonl`) ni los pesos de los modelos; es necesario obtener los artefactos del pipeline por separado para ejecutar el sistema.
- La licencia no esta especificada, por lo que no se puede confirmar el uso comercial ni la redistribucion.
- El clasificador de veracidad esta entrenado sobre GossipCop (17.527 ejemplos), un dataset de noticias de cotilleo en ingles; su generalizacion a otros dominios o idiomas no esta validada.
- El rendimiento reportado (accuracy 0,8725, F1 fake 0,7319) procede de validacion cruzada out-of-fold sobre el mismo corpus, no de una evaluacion externa independiente.
- Riesgo de alucinacion en las explicaciones generadas por Gemini flash-lite: el verbalizador puede producir justificaciones no sustentadas por la evidencia; el sistema mitiga parcialmente con cache y con la atribucion por frases.
- La dependencia de la API de Gemini implica coste y latencia externos, y sin `GEMINI_API_KEY` solo se muestran las explicaciones ya cacheadas.
- El diccionario de palabras senal esta definido manualmente, lo que introduce sesgo humano en la seleccion de evidencias.
- La model card esta en coreano y no documenta sesgos conocidos, limitaciones de contexto ni restricciones de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/yusuklee/Crystal
- Imagen Docker: `docker pull yusuklee/crystal:latest` (referenciada en la model card)
- Referencia al sistema base PRISM (demo CIKM'26): mencionada en la model card, sin URL disponible
- Referencia a CROWN (crown-www25): mencionada en la model card, sin URL disponible
- Referencia a ContextCite: mencionada en la model card, sin URL disponible
- Referencia a GossipCop: dataset mencionado en la model card, sin URL disponible
