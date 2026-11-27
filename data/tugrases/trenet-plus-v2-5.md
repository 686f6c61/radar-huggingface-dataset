# Tugrases/trenet-plus-v2.5

## Resumen

trenet+-v2.5 es un modelo de lenguaje de tipo decoder-only Transformer, entrenado desde cero por el desarrollador independiente Tugrases, especializado en conversación cotidiana en turco. Con aproximadamente 55 millones de parámetros (57.559.576 según los pesos en safetensors), se posiciona como la tercera iteración de una saga de modelos experimentales de pequeño tamaño: trenet+-v1.5 (25M) y trenet-v2 (35M). Su objetivo declarado no es competir con modelos grandes, sino explorar hasta dónde puede llegar un modelo minúsculo en diálogo multirretorno, seguimiento de contexto conversacional y extracción de significado a nivel de frase en turco.

El modelo ha sido entrenado en un entorno doméstico con una única tarjeta gráfica, con aproximadamente 3.500 millones de tokens de preentrenamiento seguidos de un ajuste fino conversacional multirretorno. Emplea un tokenizador específico para turco y una ventana de contexto de 2048 tokens. Su relevancia actual radica en que ejemplifica la viabilidad de entrenar modelos de lenguaje funcionales en turco con recursos muy limitados, y en que publica resultados en seis benchmarks abiertos de turco (0-shot), lo que permite trazar la evolución de capacidades a medida que crece el número de parámetros.

La ficha del autor lo describe explícitamente como un experimento de investigación y advierte de que no debe usarse para tareas serias. La licencia MIT facilita su uso, modificación y redistribución con fines experimentales o educativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (diseño propio a pequeña escala) |
| Parámetros totales | 57.559.576 (~55M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only de diseño propio, optimizado para escala pequeña. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni detalles del tokenizador más allá de que está adaptado al turco. El entrenamiento consta de una fase de preentrenamiento con aproximadamente 3.500 millones de tokens y una fase posterior de ajuste fino para conversación multirretorno. No se documenta si se emplearon técnicas de alineación como RLHF o DPO, ni la composición exacta del corpus; el autor indica que los detalles del conjunto de datos y del entrenamiento no se comparten.

Como innovación práctica, el script de chat incluido (`chat.py`) incorpora un pequeño calculador que verifica las operaciones aritméticas básicas, lo que mitiga parcialmente los errores en sumas, restas, multiplicaciones y porcentajes. Esta comprobación puede desactivarse con `--no-calculator`. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional natural y breve en turco: saludos, cortesía, consejos cotidianos y respuestas empáticas.
- Seguimiento de contexto multirretorno: recuerda nombres, preferencias y el tema de turnos anteriores dentro de la ventana de 2048 tokens.
- Extracción de significado a nivel de frase: preguntas de excepción y comparación sencillas.
- Seguimiento de instrucciones cortas: listas, respuestas de una sola frase y resúmenes breves.
- Aritmética básica de cuatro operaciones y cálculos de porcentaje, con apoyo opcional de calculadora externa.
- No soporta tool calling ni function calling de forma nativa.
- No está diseñado para razonamiento multi-paso avanzado ni para uso como agente.
- Capacidad multilingüe limitada al turco; no se documenta soporte de otros idiomas.
- No dispone de modo "thinking", visión, audio ni otras modalidades.

## Casos de uso

- Prototipado de asistentes conversacionales en turco: el modelo puede gestionar diálogos cotidianos de varios turnos con contexto de 2048 tokens, suficiente para conversaciones breves de atención al cliente o acompañamiento, y su reducido tamaño permite desplegarlo en hardware modesto.
- Investigación sobre eficiencia en modelos pequeños: sirve como referencia para estudiar cómo evolucionan las capacidades lingüísticas al pasar de 25M a 35M y 55M de parámetros en un mismo dominio e idioma, con benchmarks públicos comparables.
- Educación y docencia: permite ilustrar el funcionamiento de un LLM completo (tokenizador, pesos, script de chat) en un portátil sin GPU, ya que el autor confirma que funciona en CPU.
- Generación de respuestas empáticas breves: adecuado para experimentos de chatbots de bienestar o acompañamiento conversacional en turco, siempre con supervisión humana y sin tratar sus salidas como información fiable.
- Cálculo cotidiano asistido: con el calculador integrado en `chat.py`, puede resolver operaciones de descuentos, porcentajes e importes en contextos de compra o presupuesto doméstico.
- Evaluación comparativa de benchmarks turcos: útil como línea base de bajo coste en experimentos que midan XCOPA-TR, HellaSwag-TR, ARC-Challenge-TR, Belebele-TR o TurkishMMLU, al ser un modelo abierto con resultados publicados.
- Demostraciones y talleres sobre entrenamiento desde cero: su licencia MIT y su tamaño (0,2 GB de repositorio) facilitan su inclusión en materiales formativos y entornos de prácticas.

## Benchmarks y rendimiento

Resultados publicados por el autor en benchmarks abiertos de turco, en modo 0-shot con log-probabilidad (6.735 preguntas en total):

| Benchmark | Preguntas | Azar | trenet+-v1.5 (25M) | trenet-v2 (35M) | trenet+-v2.5 (55M) |
|---|---:|---:|---:|---:|---:|
| XCOPA-TR | 500 | 50,0 % | 54,4 % | 54,6 % | 57,2 % |
| HellaSwag-TR | 1.997 | 25,0 % | 25,4 % | 25,9 % | 29,1 % |
| WinoGrande-TR | 1.266 | 50,0 % | 49,5 % | 49,2 % | 48,7 % |
| ARC-Challenge-TR | 1.172 | 25,0 % | 24,3 % | 24,2 % | 26,2 % |
| Belebele-TR | 900 | 25,0 % | 30,3 % | 29,6 % | 30,3 % |
| TurkishMMLU | 900 | 20,0 % | 18,3 % | 18,2 % | 19,3 % |
| **Media** | **6.735** | **32,5 %** | 33,7 % | 33,6 % | **35,1 %** |

El modelo mejora a sus predecesores en XCOPA-TR, HellaSwag-TR, ARC-Challenge-TR, Belebele-TR y TurkishMMLU, pero empeora ligeramente en WinoGrande-TR (48,7 % frente a 49,5 % de v1.5) y queda por debajo del azar en TurkishMMLU (19,3 % frente a 20,0 %). La media global sube 1,4 puntos porcentuales respecto a v1.5. No se han publicado resultados de benchmarks en la información disponible para tareas generativas como HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (fp32), dado que los pesos ocupan aproximadamente 0,2 GB; en fp16 o cuantización de 8 bits se reduce aún más.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. También funciona en CPU, según indica el autor.
- Cabe en cualquier GPU consumer, incluidas integradas y portátiles de gama baja, y en Raspberry Pi y similares si se ejecuta en CPU.
- Opciones de despliegue: el repositorio incluye un script de chat propio (`chat.py`) basado en PyTorch, tokenizers y safetensors. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no hay una ruta directa a llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera latencia muy baja en GPU y aceptable en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Resultados publicados |
|---|---:|---:|---|---|---|
| trenet+-v2.5 | ~55M | 2048 | Turco | MIT | Media 35,1 % en 6 benchmarks turcos |
| trenet-v2 | ~35M | No disponible | Turco | MIT | Media 33,6 % en los mismos benchmarks |
| trenet+-v1.5 | ~25M | No disponible | Turco | MIT | Media 33,7 % en los mismos benchmarks |

No se dispone de información sobre otros modelos pequeños comparables de turco con licencia abierta y benchmarks publicados en la documentación proporcionada, por lo que la comparativa se limita a las versiones anteriores de la misma familia.

## Limitaciones y advertencias

- El propio autor advierte de que es un experimento de investigación y de que no debe usarse para tareas serias.
- Riesgo alto de alucinación: el modelo puede inventar respuestas plausibles en temas que desconoce.
- No es una fuente de conocimiento fiable; no debe emplearse para consultas factuales.
- Limitaciones claras en código complejo, traducción larga y matemáticas avanzadas de varios pasos.
- Puede fallar en problemas multietapa y acertijos que no haya visto durante el entrenamiento.
- Olvida detalles antiguos en conversaciones muy largas, pese a la ventana de 2048 tokens.
- Rendimiento por debajo del azar en TurkishMMLU y ligeramente inferior a su predecesor en WinoGrande-TR.
- Solo soporta turco; no se documenta capacidad multilingüe.
- Licencia MIT: permite uso comercial, modificación y redistribución siempre que se conserve la línea de copyright del texto de la licencia.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos no publicados no puede auditarse la composición del corpus.
- No se documentan mecanismos de seguridad, filtrado de contenido ni moderación; en producción requeriría capas adicionales de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tugrases/trenet-plus-v2.5
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos adicionales.
