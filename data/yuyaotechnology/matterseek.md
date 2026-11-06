# YuyaoTechnology/MatterSeek

## Resumen

MatterSeek es un modelo fundacional universal para la predicción de nuevos materiales desarrollado por Yuyao Technology (China). A diferencia de los grandes modelos de lenguaje convencionales, se trata de un modelo orientado a la ciencia de materiales: resuelve el problema de la fuerte dependencia entre composición, estructura, proceso y prestaciones en espacios de alta dimensionalidad, permitiendo tanto el diseño directo (predicción de propiedades a partir de la composición) como el diseño inverso (obtención de composición, estructura y parámetros de síntesis a partir de propiedades objetivo).

El modelo se basa en una arquitectura propietaria denominada HNN (red neuronal jerárquica, *hierarchical neural network*), guiada por razonamiento físico, que combina una columna vertebral compartida entrenada sobre 1.035 descriptores de materiales con 192 submodelos expertos de segundo nivel agrupados en 17 dominios verticales. Su relevancia radica en que no es una herramienta aislada de predicción: se integra en un bucle cerrado con un laboratorio propio de experimentación automatizada que opera 24/7, cuyos datos reales realimentan el entrenamiento del modelo de forma continua.

La versión publicada en Hugging Face está en fase beta, etiquetada como `feature-extraction` y con soporte de idiomas chino e inglés. El repositorio ocupa 0,4 GB y cuenta con 344 "likes", aunque sin descargas registradas en el momento de la ficha. No se ha publicado información sobre número de parámetros, longitud de contexto ni datos de benchmarks cuantitativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HNN (red neuronal jerárquica propietaria, guiada por razonamiento físico), dos niveles: backbone compartido + 192 submodelos expertos |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un MoE convencional; usa 192 submodelos expertos por dominio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | yuyaotechnology-matterseek-eula (licencia personalizada, tipo EULA) |
| Formato de pesos | no disponible (tamaño del repo: 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura HNN descrita en la model card sigue un diseño jerárquico de dos niveles. En el primer nivel, un backbone compartido aprende representaciones de materiales transversales a partir de una huella digital (*fingerprint*) de 1.035 descriptores de materiales. En el segundo nivel, 192 submodelos expertos, agrupados en 17 dominios verticales de primer nivel, están afinados sobre materiales que presentan la propiedad objetivo. La model card menciona el uso de regularización informada por física (*physics-informed regularization*), aunque el texto se corta y no detalla el resto de la técnica. Según el propio autor, el 92 % del modelo es de desarrollo propio.

En cuanto al entrenamiento, la model card indica que se emplean datos experimentales de alto estándar, y destaca un bucle cerrado experimental: el laboratorio propio de Yuyao ejecuta experimentos automatizados de forma continua, y los datos reales (validados mediante análisis de fases por XRD y análisis morfológico y de composición por SEM/EDS) se realimentan para entrenamiento online y mejora recursiva del modelo. No se han publicado detalles sobre el número de tokens, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO (no aplicables directamente a un modelo de regresión/predicción de materiales).

## Capacidades

- Diseño inverso de materiales: dado un conjunto de propiedades objetivo, el modelo predice directamente composición, estructura cristalina y parámetros de proceso de síntesis.
- Diseño directo (predicción de propiedades): a partir de la composición o de instrucciones en lenguaje natural, predice las propiedades del material.
- Entrada selectiva sin prompts profesionales: selección de elementos directamente desde una tabla periódica interactiva.
- Filtrado por restricciones de elementos: filtrado rápido del espacio de materiales candidatos por rango de composición elemental.
- Definición de métricas de propiedades personalizadas para diseño directo a demanda.
- Visualización multidimensional de los resultados de predicción para apoyar la toma de decisiones.
- Orquestación de submodelos: invocación concurrente de los 192 submodelos expertos de dominio mediante llamadas a funciones dentro de la misma topología.
- Cobertura universal de materiales inorgánicos y orgánicos.
- Acepta instrucciones en lenguaje natural (chino e inglés) como entrada.

## Casos de uso

- Descubrimiento de nuevos materiales inorgánicos: un investigador introduce propiedades objetivo (por ejemplo, conductividad o dureza) y el modelo devuelve composiciones candidatas con estructura cristalina y parámetros de síntesis, reduciendo el número de experimentos de prueba y error.
- Diseño de materiales orgánicos: los dominios verticales afinados permiten predecir formulaciones orgánicas con propiedades objetivo específicas, útil en polímeros o química fina.
- Optimización de procesos de síntesis: exportación de parámetros de procesado recomendados junto con la composición, validables posteriormente en laboratorio.
- Filtrado de espacio químico: uso de restricciones de rango elemental para acotar candidatos cuando existen limitaciones de coste, disponibilidad de materias primas o restricciones regulatorias.
- Exploración interactiva por equipos no expertos: la selección de elementos desde una tabla periódica interactiva permite que personal técnico sin experiencia en prompts utilice el modelo.
- Validación experimental en bucle cerrado: integración con plataformas de laboratorio automatizado que comparan valores medidos (XRD, SEM/EDS) contra los predichos, para afinar procesos internos de I+D.
- Apoyo a decisiones de I+D industrial: la visualización multidimensional de predicciones facilita la priorización de líneas de investigación en departamentos de materiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las predicciones se validan mediante experimentos de laboratorio en bucle cerrado, pero no incluye métricas cuantitativas (MAE, R², exactitud de recuperación de fase, etc.) ni comparaciones con otros modelos de predicción de materiales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,4 GB, lo que sugiere un modelo ligero, pero no hay datos oficiales de consumo de memoria.
- GPU recomendadas: no disponible. Dado el tamaño del repo, es plausible que funcione en hardware de consumo, pero no está confirmado por el autor.
- Cabe en GPU de consumo: no disponible (sin datos oficiales; el peso de 0,4 GB apunta a que sí, pero debe verificarse).
- Opciones de despliegue: la vía principal documentada es el Space de Hugging Face (demo en vivo) y el sitio web oficial (matterseek.ai). No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI; al no ser un LLM convencional, estas herramientas probablemente no apliquen directamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Desarrollador | Dominio | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatterSeek | Yuyao Technology | Predicción universal de materiales (inorgánicos y orgánicos) | HNN jerárquica con 192 submodelos expertos | EULA personalizada | Beta en Hugging Face + demo en Spaces |
| MatterGen | Microsoft Research | Generación de materiales inorgánicos | Modelo generativo difusional | Licencia MIT (código) | Código y pesos públicos |
| GNoME | Google DeepMind | Descubrimiento de cristales inorgánicos | Redes neuronales de grafos (GNN) + aprendizaje activo | Publicaciones abiertas, modelo no totalmente liberado | Resultados publicados en Nature |

MatterSeek se diferencia de MatterGen y GNoME en su enfoque: mientras estos se centran en generación o descubrimiento de cristales inorgánicos, MatterSeek ofrece diseño directo e inverso con parámetros de proceso de síntesis y validación experimental en bucle cerrado. Su cobertura orgánica e inorgánica y su interfaz de lenguaje natural lo acercan más a un producto integral de I+D que a un modelo de investigación abierto.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye bajo una EULA personalizada (yuyaotechnology-matterseek-eula), no bajo una licencia estándar open source. Debe revisarse el texto de la licencia antes de cualquier uso comercial, ya que puede imponer restricciones significativas.
- Falta de transparencia técnica: no se publican número de parámetros, datos de entrenamiento detallados, métricas de validación ni benchmarks comparativos, lo que dificulta una evaluación independiente y reproducible.
- Fase beta: el modelo está etiquetado explícitamente como beta, por lo que las predicciones pueden contener errores y no deben usarse como única base para decisiones de síntesis sin validación experimental.
- Riesgo de alucinación o predicciones erróneas: como en todo modelo predictivo de materiales, las composiciones recomendadas pueden no ser sintetizables o no alcanzar las propiedades previstas; la validación con XRD/SEM/EDS es imprescindible.
- Sesgo de datos: el entrenamiento se realimenta desde el laboratorio propio de Yuyao, lo que puede introducir sesgos hacia los sistemas de materiales y condiciones experimentales de esa plataforma.
- Idiomas limitados: la interfaz de lenguaje natural solo soporta chino e inglés.
- Repositorio sin descargas registradas: la comunidad aún no ha validado de forma independiente el modelo, y la model card mezcla contenido promocional con información técnica.
- Documentación incompleta: la descripción de la arquitectura aparece truncada en la model card, por lo que algunos detalles técnicos (regularización informada por física) no son verificables.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/YuyaoTechnology/MatterSeek
- Demo en vivo (Hugging Face Spaces): https://huggingface.co/spaces/YuyaoTechnology/MatterSeek
- Sitio web oficial: https://www.yuyaomatterseek.net
- Vídeo demo del producto: https://huggingface.co/YuyaoTechnology/MatterSeek/resolve/main/%E4%BA%A7%E5%93%81%E4%BD%BF%E7%94%A8-2.mp4
- Vídeo promocional: https://huggingface.co/YuyaoTechnology/MatterSeek/resolve/main/%E5%85%AC%E5%8F%B8-%E4%BF%AE%E6%94%B92.mp4
- Licencia (LICENSE en el repo): https://huggingface.co/YuyaoTechnology/MatterSeek/blob/main/LICENSE
- Paper científico: no disponible
