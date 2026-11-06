# xiaomeimei008/ZhaoSiHan-33B-MLX

## Resumen

ZhaoSiHan-33B-MLX es una conversión a formato MLX y cuantización de 4 bits de un modelo de 33 000 millones de parámetros, publicada por el usuario xiaomeimei008 bajo licencia Apache 2.0. La model card la vincula explícitamente con la familia Nanbeige y la describe como una versión "de velocidad extrema" optimizada para Apple Silicon, con un peso cuantizado de 14,97 GB y soporte declarado para chino e inglés.

El modelo se distribuye exclusivamente en formato MLX de 4 bits, lo que lo hace ejecutable de forma nativa en chips de la serie M de Apple mediante la librería MLX y el cliente de escritorio Rapid-MLX. La model card menciona además un "harness" denominado dsh (DeepSeek Harness) y una biblioteca de herramientas de criptoanálisis de 64 núcleos, si bien no se aportan detalles técnicos verificables sobre dichas capacidades.

La información publicada es muy escasa: no se detallan la arquitectura interna, el número de tokens de entrenamiento, los datos de alineación ni resultados de benchmarks. La ficha siguiente recoge lo que consta en la información disponible y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica que deriva de la familia Nanbeige) |
| Parámetros totales | 33B (según la model card) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (formato MLX); peso resultante de 14,97 GB |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (cuantizado a 4 bits) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo: la model card no especifica si se trata de un transformer denso, un modelo de mezcla de expertos ni la configuración de capas y cabezas de atención. Tampoco se documentan el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases de RLHF, DPO u otra forma de alineación.

La única información técnica concreta es que se trata de una conversión a MLX con cuantización de 4 bits, orientada a la ejecución en Apple Silicon, y que el autor declara haber aplicado optimizaciones para reducir la latencia del primer token ("端到端首字延迟降至毫秒级"). También se menciona una "biblioteca de herramientas de algoritmos inversos de 64 núcleos" que cubriría criptografía simétrica y asimétrica, hashes, ofuscación y análisis de protocolos, pero sin especificar cómo se integra en el modelo ni qué interfaz expone. No hay información verificable sobre decodificación especulativa, atención lineal ni otras innovaciones.

## Capacidades

- Generación de texto en chino e inglés, según los idiomas declarados en la model card.
- Ejecución nativa en Apple Silicon mediante MLX, con pesos ya cuantizados a 4 bits.
- Integración con el cliente de escritorio Rapid-MLX, que permite cargar el modelo introduciendo su identificador en el buscador.
- La model card declara un "toolkit" de criptoanálisis y análisis de protocolos, aunque no se detalla su API ni su funcionamiento.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".

## Casos de uso

- Inferencia local en Mac con chip de la serie M: el peso de 14,97 GB en 4 bits permite cargar el modelo en equipos con memoria unificada de 24 GB o superior, sin necesidad de GPU dedicada.
- Prototipado rápido de aplicaciones de texto en chino e inglés: al integrarse con Rapid-MLX, se puede probar el modelo desde un cliente de escritorio sin montar infraestructura de servidor.
- Evaluación de modelos de 33B en entornos de investigación con hardware Apple: sirve como referencia para comparar latencia y calidad frente a otras conversiones MLX del mismo tamaño.
- Procesamiento por lotes de textos en local: al ejecutarse íntegramente en el equipo, evita enviar datos a servicios en la nube, lo que resulta útil para documentos sensibles.
- Experimentación con cuantización de 4 bits: el repositorio permite estudiar el equilibrio entre tamaño (14,97 GB) y calidad en un modelo de 33B.
- Base para ajuste fino o evaluación posterior: al estar bajo Apache 2.0, se puede reutilizar y modificar, siempre que se validen antes las capacidades reales del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el peso en 4 bits ocupa 14,97 GB; se recomienda al menos 24 GB de memoria unificada para dejar margen a la caché KV y al contexto.
- GPU recomendadas: chips Apple Silicon de la serie M (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). No se documenta soporte para GPU NVIDIA o AMD.
- Cabe en equipos de consumo con Apple Silicon de gama alta; no es ejecutable de forma nativa en GPU de consumo convencionales sin conversión previa a otro formato.
- Opciones de despliegue: MLX y el cliente Rapid-MLX; la model card menciona también dsh (DeepSeek Harness). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor afirma una latencia de primer token de milisegundos, pero no aporta mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de contexto que permitan una comparación rigurosa con otros modelos de 33B.

## Limitaciones y advertencias

- La información publicada es mínima: no hay arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- El modelo se distribuye únicamente en formato MLX de 4 bits; no hay pesos en safetensors ni GGUF, lo que limita su uso fuera de Apple Silicon.
- Solo se declaran chino e inglés; no hay evidencia de soporte multilingüe adicional.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo original, especialmente en tareas de razonamiento y código.
- Las capacidades de criptoanálisis y análisis de protocolos que menciona la model card no están documentadas ni verificadas; deben tratarse como una afirmación del autor, no como una funcionalidad confirmada.
- Riesgo de alucinación y sesgos: no disponible, al no haberse publicado evaluaciones.
- La licencia Apache 2.0 permite uso comercial, pero al no conocerse el modelo base exacto ni sus condiciones originales, conviene verificar la procedencia antes de un despliegue en producción.
- El repositorio no registra descargas ni valoraciones, por lo que no hay señal de uso comunitario que respalde su fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiaomeimei008/ZhaoSiHan-33B-MLX
- Librería MLX: https://github.com/ml-explore/mlx
- Cliente Rapid-MLX: no disponible (no se proporciona URL en la información)
- dsh (DeepSeek Harness): no disponible (no se proporciona URL en la información)
- Paper, blog o repositorio del modelo base Nanbeige: no disponible en la información proporcionada
