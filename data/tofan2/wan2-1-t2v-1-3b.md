# tofan2/Wan2.1-T2V-1.3B

## Resumen

Wan2.1-T2V-1.3B es un modelo de generación de video a partir de texto desarrollado por Wan-AI, dentro de la suite abierta Wan2.1. Se trata de la variante reducida del modelo T2V-14B, diseñada específicamente para funcionar en GPUs de consumo: requiere solo 8,19 GB de VRAM y puede generar clips de 5 segundos a 480P en una RTX 4090 en aproximadamente 4 minutos sin técnicas de optimización. El modelo se presenta como una alternativa accesible para equipos creativos e investigadores con recursos de cómputo limitados.

Arquitectónicamente, es un modelo de difusión basado en transformers (DiT) que utiliza el VAE de video Wan-VAE, capaz de codificar y decodificar video 1080P de cualquier longitud. El repositorio en Hugging Face de esta ficha (tofan2/Wan2.1-T2V-1.3B) contiene los pesos en formato safetensors, con un total de 1.418.996.800 parámetros (aproximadamente 1.42B). La licencia es Apache-2.0, lo que permite uso comercial.

La relevancia actual del modelo radica en que democratiza la generación de video de calidad: no requiere clústeres de GPUs ni infraestructura especializada, y ofrece una calidad comparable a algunos modelos cerrados según las evaluaciones del propio autor. Además, Wan2.1 incorpora una capacidad innovadora de generación de texto visual tanto en inglés como en chino, lo que amplía sus aplicaciones prácticas en publicidad y contenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion basado en transformer (DiT) con VAE de video (Wan-VAE) |
| Parametros totales | 1.418.996.800 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de generacion de video, no de lenguaje) |
| Tipos de cuantizacion | No disponible (no se mencionan en la documentacion) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Wan2.1-T2V-1.3B es un modelo de generación de texto a video basado en un transformer de difusión (DiT). El proceso de generación se apoya en el VAE de video Wan-VAE, que según la documentación del autor ofrece una eficiencia destacada y es capaz de codificar y decodificar video 1080P de cualquier longitud preservando la información temporal. El modelo es una variante reducida del T2V-14B, con la misma filosofía de diseño pero optimizada para minimizar el consumo de VRAM (8,19 GB) y ser compatible con GPUs de consumo.

En cuanto a los datos de entrenamiento, no se han publicado detalles sobre el número de tokens, la composición del dataset ni el proceso de alineación (RLHF/DPO). El autor no ha publicado el paper (indica "coming soon") ni una descripción técnica detallada de la arquitectura. La información disponible se limita a las capacidades declaradas en el README y a los benchmarks propios del autor. Tampoco se mencionan innovaciones como decodificación especulativa o attention lineal; el foco está en la eficiencia práctica y la calidad visual.

## Capacidades

- Generación de video a partir de texto (text-to-video) con resolución 480P de forma óptima y 720P de forma opcional, aunque menos estable (el autor recomienda 480P).
- Generación de texto visual en chino e inglés: Wan2.1 se presenta como el primer modelo de video capaz de generar texto legible en ambos idiomas, lo que resulta útil para rótulos, títulos y elementos gráficos.
- Compatibilidad con GPUs de consumo: requiere solo 8,19 GB de VRAM, por lo que funciona en tarjetas como RTX 4090 o similares sin necesidad de cuantización.
- Generación de clips de 5 segundos a 480P en aproximadamente 4 minutos en una RTX 4090 sin optimizaciones adicionales.
- Soporte de código de inferencia multi-GPU en el repositorio oficial de GitHub, tanto para el modelo 1.3B como para el 14B.
- El modelo no soporta tool calling, function calling ni capacidades de agentes; es un modelo de generación de video puro.
- No incluye capacidades de visión (image-to-video) en esta variante: para I2V se necesita el modelo Wan2.1-I2V-14B.

## Casos de uso

- Generación de clips para redes sociales: el modelo permite crear videos cortos de 5 segundos a partir de prompts de texto, lo que resulta útil para contenido en plataformas como Instagram, TikTok o YouTube Shorts. Al requerir poca VRAM, puede ejecutarse en una estación de trabajo con GPU de consumo.

- Prototipado de anuncios y publicidad: gracias a la generación de texto visual en inglés y chino, se pueden producir rápidamente videos con rótulos, slogans o carteles integrados en la escena, facilitando la iteración en campañas de marketing antes de invertir en producción profesional.

- Storyboarding y previsualización cinematográfica: directores y creativos pueden generar tomas preliminares para visualizar ideas de guion, composición o movimiento de cámara. La generación a 480P es suficiente para comunicar la intención de una escena sin necesidad de renderizados costosos.

- Creación de fondos de video para interfaces y web: el modelo puede generar clips ambientales o abstractos que sirvan como fondos animados en webs, dashboards o presentaciones, siempre que el clip sea corto y la resolución 480P sea aceptable.

- Generación de datasets sintéticos para investigación: el modelo permite crear pares texto-video que pueden utilizarse para entrenar o evaluar otros modelos de video o de visión-lenguaje, especialmente en entornos académicos con presupuesto limitado.

- Educación y demos en aulas: por su bajo requerimiento de VRAM y su licencia Apache-2.0, el modelo es adecuado para demostraciones en cursos de IA generativa o en talleres donde no se dispone de infraestructura cloud. Los alumnos pueden experimentar con la generación de video en sus propios portátiles con GPU.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor menciona en la página de ModelScope que, según su framework Wan-Bench, el modelo T2V-1.3B supera las métricas globales de modelos open-source más grandes, pero no se aportan cifras concretas en el material de referencia. Tampoco se ofrecen comparativas con modelos comerciales cerrados. Por tanto, no se pueden presentar datos verificables de rendimiento en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: 8,19 GB según el README del autor (sin cuantización).
- GPU recomendada: el autor indica que el modelo es compatible con "casi todas las GPUs de consumo". Como referencia, una RTX 4090 genera un video de 5 segundos a 480P en unos 4 minutos sin optimizaciones.
- Cabe en GPUs de consumo con 12 GB o más de VRAM, como RTX 3060 12GB, RTX 4070, RTX 4090 o GPUs de Apple Silicon con suficiente memoria unificada. En GPUs con menos VRAM, puede ser necesario reducir la resolución o aplicar técnicas de offloading.
- Opciones de despliegue: el repositorio oficial de Wan2.1 en GitHub incluye código de inferencia multi-GPU y una demo Gradio. El repositorio de Hugging Face de esta ficha está etiquetado como diffusers, aunque en el roadmap del autor la integración completa con Diffusers figura como pendiente. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: en una RTX 4090, un clip de 5 segundos a 480P tarda aproximadamente 4 minutos en generarse sin técnicas de cuantización u optimización. No se proporcionan datos de throughput en otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion soportada | Tareas | VRAM minima | Licencia |
|---|---|---|---|---|---|
| Wan2.1-T2V-1.3B | 1.418.996.800 | 480P (recomendado), 720P (menos estable) | Text-to-video | 8,19 GB | Apache-2.0 |
| Wan2.1-T2V-14B | No disponible | 480P y 720P | Text-to-video | No disponible | Apache-2.0 |
| Wan2.1-I2V-14B-480P | No disponible | 480P | Image-to-video | No disponible | Apache-2.0 |
| Wan2.1-I2V-14B-720P | No disponible | 720P | Image-to-video | No disponible | Apache-2.0 |

La comparativa se basa exclusivamente en la información proporcionada por el autor en el README. El modelo 1.3B se diferencia del 14B por su menor tamaño y su optimización para GPUs de consumo, pero no admite image-to-video ni otras tareas de la suite. No se dispone de datos de benchmarks comparativos verificables entre ambas variantes.

## Limitaciones y advertencias

- El modelo 1.3B está optimizado para 480P; la generación a 720P es posible pero el autor advierte que los resultados son menos estables debido al entrenamiento limitado a esa resolución.
- Esta variante solo soporta text-to-video. No incluye image-to-video, video editing ni otras tareas presentes en los modelos de mayor tamaño de la suite Wan2.1.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos en el contenido generado, especialmente en representaciones de personas, culturas o situaciones.
- El riesgo de alucinación visual es inherente a los modelos de generación de video: el modelo puede producir objetos, movimientos o texturas que no corresponden al prompt, así como texto ilegible o incorrecto en los rótulos.
- La generación de texto visual en chino e inglés puede fallar en la precisión ortográfica o en la coherencia del texto dentro de la escena.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe revisar las condiciones de uso de los modelos y assets incluidos en el repositorio de Wan-AI, ya que no se proporciona una declaración explícita sobre marcas o derechos de terceros.
- El rendimiento declarado (8,19 GB de VRAM, 4 minutos en RTX 4090) corresponde a condiciones sin optimización; con cuantización u otras técnicas los tiempos pueden variar, pero no hay datos publicados al respecto.
- No se han publicado evaluaciones de seguridad ni filtros de contenido, por lo que el modelo podría generar material sensible si el prompt lo solicita.

## Enlaces

- Repositorio de Hugging Face de esta ficha: https://huggingface.co/tofan2/Wan2.1-T2V-1.3B
- Repositorio oficial de Hugging Face: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Repositorio de GitHub: https://github.com/Wan-Video/Wan2.1
- Página de ModelScope: https://modelscope.cn/models/Wan-AI/Wan2.1-T2V-1.3B (alternativa: https://modelscope.ai/models/Wan-AI/Wan2.1-T2V-1.3B)
- Blog del proyecto: https://wanxai.com
- Discord del proyecto: https://discord.gg/p5XbdQV7
