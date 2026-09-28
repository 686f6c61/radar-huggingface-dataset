# Theboukadida/laura-ar-lfm2.5-1.2b-GGUF

## Resumen

Laura es un ajuste fino del modelo LiquidAI/LFM2.5-1.2B-Instruct, publicado por el usuario Theboukadida en formato GGUF cuantizado a Q4_K_M. Se trata de un modelo especializado en la enseñanza del alemán para estudiantes adultos principiantes (niveles A1–A2) cuya lengua materna es el árabe: el modelo conversa en árabe y utiliza ejemplos en alemán para explicar gramática, vocabulario y correcciones. El caso de uso declarado es una aplicación de curso de alemán sin conexión que se ejecuta íntegramente en un teléfono, solo con CPU.

Técnicamente, parte del modelo base LFM2.5-1.2B-Instruct (familia LFM2 de Liquid AI, con arquitectura optimizada para despliegue en el borde). Sobre ese modelo se entrenó un adaptador LoRA de rango 16 aplicado a todas las capas lineales durante 2 épocas, con entre 2.500 y 3.300 conversaciones cortas de tutoría en árabe. El adaptador se fusionó con los pesos base y el resultado se convirtió a GGUF y se cuantizó con llama.cpp. El único archivo publicado pesa 0,73 GB.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de ajuste fino pequeño, barato y orientado a un producto real (tutoría de idiomas offline); por otro, ilustra un patrón interesante de diseño, en el que el sistema no confía al modelo la evaluación del alemán, sino que una herramienta externa (un diccionario propio de la app) genera una nota de verificación que el modelo se limita a explicar. Con ese contexto añadido, el autor reporta un 72,2% de respuestas con enseñanza correcta en conversaciones retenidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2 (Liquid AI), descrita por el fabricante como "optimizada para dispositivo"; no se detalla la composición interna en la información disponible |
| Parametros totales | 1,2 B (según el nombre del modelo base, LFM2.5-1.2B-Instruct) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | Alemán (de) y árabe (ar) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada del modelo base |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo deriva de LiquidAI/LFM2.5-1.2B-Instruct, un modelo de 1,2 B de parámetros de la familia LFM2 que Liquid AI describe como su arquitectura optimizada para despliegue en el borde. La información disponible no detalla la composición exacta de capas ni si emplea mecanismos híbridos de atención, por lo que este apartado se limita a lo declarado por el autor del ajuste.

El proceso de adaptación consistió en entrenar un adaptador LoRA de rango 16 aplicado a todas las capas lineales durante 2 épocas, sobre un conjunto de aproximadamente 2.500–3.300 conversaciones cortas de tutoría en árabe. Posteriormente, el adaptador se fusionó con los pesos del modelo base, el resultado se convirtió a GGUF y se cuantizó a Q4_K_M mediante llama.cpp. No se menciona uso de RLHF ni DPO. La innovación destacable no es arquitectónica sino de diseño de sistema: el modelo se entrenó con notas de verificación inyectadas en el mensaje por la aplicación (veredicto de corrección con la frase corregida y el motivo, más significados del diccionario y la tarjeta de reglas del capítulo). El propio autor advierte que sin esas notas el modelo es un profesor mucho más débil.

## Capacidades

- Generación de texto conversacional en árabe con fines didácticos: explica gramática y vocabulario alemanes dirigidos a un estudiante arabófono.
- Tutoría de alemán en niveles A1–A2: correcciones, ejemplos, aclaraciones y explicaciones de reglas.
- Interpretación de notas externas de verificación: recibe cadenas del tipo `(Check: ✗ → „frase corregida“ · motivo)` o `(Check: ✓ …)` generadas por la app y las explica al alumno.
- Integración de material auxiliar en la respuesta: significados del diccionario propio de la aplicación y tarjetas de reglas del capítulo.
- Ejecución en dispositivo: inferencia en CPU, sin conexión, en el móvil del usuario.
- Multilingüe limitado a dos idiomas (alemán y árabe), con el árabe como lengua de instrucción y el alemán como lengua objeto.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Tutor de alemán offline en aplicación móvil: es el caso de uso original. El modelo se ejecuta en el teléfono con CPU y sin red, de modo que el alumno puede practicar en cualquier lugar sin coste de API ni dependencia de conectividad, con un archivo de 0,73 GB.
- Generación de ejercicios A1–A2 con enunciados en árabe y ejemplos en alemán: útil para producir contenido didáctico personalizado a partir de la tarjeta de reglas del capítulo activo.
- Corrección explicada de frases del alumno: la app detecta el error con su diccionario y el modelo redacta la explicación en árabe apoyándose en la nota de verificación y en el significado de las palabras implicadas.
- Práctica de vocabulario contextualizado: a partir de un listado de términos del diccionario, el modelo construye ejemplos en alemán y los comenta en árabe, reforzando el uso real de cada palabra.
- Simulación de diálogos por capítulo: conversaciones guiadas (presentarse, pedir en un restaurante, hablar del trabajo) en las que el modelo mantiene el papel del interlocutor y aprovecha las reglas del capítulo para reconducir al alumno.
- Asistente embebido en dispositivos con recursos muy limitados: cualquier aplicación que necesite un modelo conversacional de ~1 GB de huella y ejecución en CPU puede reutilizar este artefacto.
- Base para nuevos ajustes LoRA en otros pares de idiomas: el procedimiento documentado (LoRA de rango 16 en todas las capas lineales, 2 épocas, fusión y conversión a GGUF) es directamente replicable para otros contextos educativos o de atención al cliente.
- Prototipado rápido de producto educativo sin presupuesto de infraestructura: el coste de despliegue se reduce a la distribución de un archivo GGUF y a un runtime de inferencia ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, GSM8K, HumanEval ni similares) en la información disponible. El autor únicamente reporta una evaluación propia:

| Evaluacion | Resultado | Metodologia |
|---|---|---|
| Enseñanza correcta en conversaciones retenidas | 72,2 % de respuestas | Corrección manual sobre conversaciones no vistas durante el entrenamiento; se exige que todos los datos y motivos alemanes sean correctos |

Advertencia: se trata de una métrica personalizada del autor, sin comparación con terceros ni replicación independiente. No es equiparable a un benchmark estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en Q4_K_M (el archivo GGUF ocupa 0,73 GB); con la caché KV y el overhead del runtime, el consumo real se sitúa aproximadamente entre 1 y 1,5 GB.
- CPU: viable sin GPU; el caso de uso declarado es un teléfono de gama media ejecutando el modelo en CPU.
- GPU recomendadas: cualquier GPU de consumo con 2 GB o más de memoria (por ejemplo, GTX 1050, GTX 1650, RTX 3050 o superiores) es sobradamente suficiente. No se requiere A100 ni H100 para este tamaño.
- Cabe en GPU de consumo: sí, y también en dispositivos móviles y en placas tipo Raspberry Pi 5 según la configuración de runtime (no confirmado por el autor).
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python, llamafile, `llama-server`). vLLM no ofrece soporte estable de GGUF para este perfil de modelo.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Situacion |
|---|---|---|---|---|---|
| Theboukadida/laura-ar-lfm2.5-1.2b-GGUF (este modelo) | 1,2 B | no disponible | GGUF, Q4_K_M (0,73 GB) | LFM Open License v1.0 | Publicado; 0 descargas y 0 likes en el momento de la consulta |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,2 B | no disponible | safetensors y GGUF en el repositorio base | LFM Open License v1.0 | Modelo base oficial, mucho más descargado y evaluado por terceros |
| LiquidAI/LFM2.5-1.2B-Thinking | 1,2 B | no disponible | GGUF (2,52 GB según el índice de terceros citado) | LFM Open License v1.0 | Variante orientada a razonamiento de la misma familia |
| Theboukadida/laura-lfm2.5-1.2b-GGUF | 1,2 B | no disponible | GGUF | LFM Open License v1.0 | Variante relacionada del mismo autor; no se detalla su especialización en la información disponible |

La diferencia principal frente a los modelos base no es de tamaño ni de contexto, sino de especialización: este artefacto está ajustado para tutoría de alemán en árabe y depende de las notas de verificación que le proporciona la aplicación. Frente al modelo base, cabe esperar una pérdida de capacidades generales por el ajuste estrecho, no cuantificada en la información disponible.

## Limitaciones y advertencias

- Rendimiento condicionado al contexto externo: el autor indica explícitamente que sin las notas de verificación del diccionario y la tarjeta de reglas, el modelo es un profesor mucho más débil. No debe desplegarse como tutor autónomo sin ese andamiaje.
- Evaluación limitada: el 72,2% de acierto es una medición manual del autor sobre un conjunto reducido, sin benchmark público ni replicación independiente. Un 27,8% de respuestas incorrectas es un margen de error alto para uso educativo sin supervisión.
- Riesgo de alucinación gramatical: al ser un ajuste LoRA sobre un modelo de 1,2 B, puede generar correcciones de alemán plausibles pero erróneas si el sistema no valida la frase previamente. La arquitectura de la app mitiga esto delegando la detección en un diccionario, pero las explicaciones del modelo siguen siendo generadas.
- Cobertura lingüística muy estrecha: solo alemán y árabe, y dentro del alemán únicamente niveles A1–A2. No hay datos sobre dialectos árabes soportados ni sobre el registro del árabe empleado.
- Longitud de contexto no documentada: se desconoce la ventana real del modelo base y cuánto se degrada en conversaciones largas, algo relevante porque la app inyecta diccionario, reglas y veredictos en cada turno.
- Sesgos: no se ha publicado ningún análisis de sesgos, ni culturales ni de género, ni evaluación de contenido inapropiado en un contexto educativo con adultos.
- Licencia: se distribuye bajo la LFM Open License v1.0, heredada del modelo base. Es una licencia "other" (no OSI estándar), con condiciones propias que deben revisarse antes de un uso comercial; la información disponible no detalla los términos concretos.
- Trazabilidad escasa: 0 descargas y 0 likes en el momento de la consulta, sin repositorio de entrenamiento, sin dataset público y sin semilla ni hiperparámetros completos más allá del rango LoRA, las capas y las épocas.
- Conjunto de datos no verificable: entre 2.500 y 3.300 conversaciones, sin publicar; no puede auditarse su calidad ni su licencia de origen.
- Un único artefacto publicado: no hay versiones en otros formatos (safetensors del adaptador, otras cuantizaciones) que permitan reutilizar el ajuste o comparar el efecto de la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Theboukadida/laura-ar-lfm2.5-1.2b-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Anuncio de la familia LFM2.5 (blog de Liquid AI): https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Variante relacionada del mismo autor: https://huggingface.co/Theboukadida/laura-lfm2.5-1.2b-GGUF
- Índice de terceros con el GGUF de LFM2.5-1.2B-Instruct: https://local-ai-zone.github.io/models/lfm2-5-1-2b-instruct.html
- Índice de terceros con el GGUF de LFM2.5-1.2B-Thinking: https://local-ai-zone.github.io/models/lfm2-5-1-2b-thinking.html
