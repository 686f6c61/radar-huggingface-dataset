# YuRiVeRTi/TEROM-DUST-1

## Resumen

TEROM-DUST-1 es un checkpoint de investigación de un modelo de lenguaje en inglés desarrollado por YuRiVeRTi (bajo la etiqueta TESROL), entrenado desde cero con una arquitectura transformer decoder-only propia. Con 30.259.712 parámetros, 7 capas, dimensión oculta de 512 y un vocabulario de 16.000 tokens, se posiciona en la categoría de modelos pequeños orientados a experimentación más que a producción. Su contexto máximo es de 1.024 tokens y su vocabulario y corpus están fuertemente sesgados hacia literatura inglesa, en particular Shakespeare.

El modelo resuelve, en la práctica, un problema de investigación: explorar el comportamiento de un transformer entrenado desde cero con un corpus muy específico y un tokenizador BPE byte-level personalizado. No está pensado como chatbot ni como modelo de propósito general; el propio autor lo describe como un checkpoint experimental con salidas fragmentadas, continuidad narrativa débil y una marcada tendencia a generar diálogo de estilo shakespeariano.

Su relevancia actual es limitada fuera del ámbito de la investigación reproducible. Resulta útil como caso de estudio de entrenamiento from-scratch, de arquitecturas personalizadas no compatibles con `AutoModelForCausalLM` y de los efectos de un corpus muy desequilibrado (83,58% de tokens de Shakespeare) sobre el comportamiento generativo. La licencia es "other" y el autor no concede derechos de reutilización o redistribución de los pesos en esta versión inicial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only personalizado |
| Parametros totales | 30.259.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | other (sin derechos de reutilización o redistribución de pesos en esta versión) |
| Formato de pesos | safetensors (arquitectura PyTorch personalizada, no cargable con `AutoModelForCausalLM`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de arquitectura personalizada definida en `modeling_terom.py`. Consta de 7 capas, dimensión oculta de 512, 8 cabezas de atención, activación GELU, codificación posicional RoPE y embeddings de entrada/salida atados (tied). El tokenizador es un BPE byte-level propio con vocabulario de 16.000 tokens. No se trata de un MoE ni de una arquitectura híbrida SSM; es un transformer denso convencional con decisiones de diseño propias.

El entrenamiento se realizó desde cero durante 10 épocas, con 1.540 actualizaciones del optimizador. La mejor pérdida de validación fue 5,20611759 y la mejor perplejidad de validación 182,38459013, alcanzada en la época 9. El corpus estuvo dominado por Shakespeare, que representa aproximadamente el 83,58% de los tokens de entrenamiento. No se documenta el número total de tokens, la composición completa del dataset, ni si hubo RLHF, DPO u otras fases de alineación. El corpus original no se incluye en el repositorio y los derechos de las fuentes y ediciones no están aclarados para todas las jurisdicciones.

## Capacidades

- Generación de texto en inglés con estilo fuertemente inclinado hacia diálogo y registro shakespeariano.
- Continuación de texto literario y de diálogo dramático, dentro de un contexto muy corto (1.024 tokens).
- Modelado de lenguaje autorregresivo básico; no se documentan capacidades de razonamiento, matemáticas o código.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No se documentan modos especiales (thinking mode, visión, audio).
- No se documenta compatibilidad con APIs estándar de Hugging Face (`AutoModelForCausalLM`), lo que limita su integración directa.

## Casos de uso

- Estudio de entrenamiento from-scratch: sirve para analizar cómo un transformer pequeño con arquitectura personalizada converge (perplejidad de validación 182,38) y qué errores aparecen con un corpus desequilibrado. Adecuado para investigación académica sobre dinámica de entrenamiento.
- Análisis del efecto de la composición del corpus: con un 83,58% de tokens de Shakespeare, permite estudiar cómo el sesgo de dominio afecta al estilo de salida y a la diversidad léxica. Útil en experimentos de data curation.
- Pruebas de tokenizadores BPE byte-level personalizados: su vocabulario de 16.000 tokens permite comparar el comportamiento de un tokenizador propio frente a tokenizadores estándar en tareas de modelado de lenguaje.
- Reproducción de arquitecturas no estándar: el archivo `modeling_terom.py` sirve como referencia para implementar y depurar transformers decoder-only personalizados fuera de la API de Hugging Face.
- Generación de diálogo de estilo dramático con fines educativos: puede producir fragmentos de diálogo con registro shakespeariano, siempre con revisión humana y asumiendo baja coherencia narrativa.
- Docencia sobre limitaciones de modelos pequeños: útil como ejemplo práctico de alucinación, fragmentación de salida y falta de sensibilidad a la instrucción en modelos de 30M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento reportados por el autor son métricas de validación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Mejor perdida de validacion | 5,20611759 |
| Mejor perplejidad de validacion | 182,38459013 |
| Mejor epoca | 9 |
| Actualizaciones del optimizador | 1.540 |
| Epocas | 10 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 30,26M de parámetros, los pesos en fp32 ocupan aproximadamente 121 MB; en fp16, unos 60 MB. La VRAM real depende del runtime y de las activaciones, pero es del orden de cientos de MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4060 o incluso una GPU integrada con suficiente memoria pueden ejecutarlo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 1-2 GB de VRAM libre, y también en CPU.
- Opciones de despliegue: al no ser cargable con `AutoModelForCausalLM`, requiere cargar la arquitectura personalizada desde `modeling_terom.py` con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; la conversión a GGUF no está disponible de serie.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera baja latencia en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas por el autor. A continuación se comparan características estructurales con alternativas de tamaño similar, sin datos de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TEROM-DUST-1 | 30,26M | 1.024 | other (restringida) | Hugging Face, arquitectura personalizada |
| GPT-2 small | 124M | 1.024 | MIT | Hugging Face, `AutoModelForCausalLM` |
| GPT-2 medium | 355M | 1.024 | MIT | Hugging Face, `AutoModelForCausalLM` |
| Pythia-70M | 70M | 2.048 | Apache 2.0 | Hugging Face, `AutoModelForCausalLM` |

La comparación es estructural: TEROM-DUST-1 es más pequeño que las alternativas citadas, tiene contexto más corto que Pythia-70M y una licencia más restrictiva que todas ellas. No hay datos de rendimiento comparables.

## Limitaciones y advertencias

- Salidas fragmentadas y continuidad narrativa débil, según las evaluaciones del propio autor.
- Baja sensibilidad a la instrucción (limited prompt sensitivity): no responde de forma fiable a prompts directivos.
- Fuerte tendencia a generar diálogo de estilo shakespeariano, derivada del 83,58% de tokens de Shakespeare en el corpus.
- Riesgo elevado de alucinación y de texto incoherente; no debe usarse como chatbot de producción.
- Contexto muy limitado (1.024 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés; sin capacidades multilingües declaradas.
- Licencia "other": el autor no concede derechos de reutilización ni redistribución de los pesos en esta versión inicial; los derechos del corpus original no están aclarados en todas las jurisdicciones.
- No es cargable mediante la API estándar de Hugging Face, lo que complica su integración en pipelines existentes.
- No se documentan sesgos específicos más allá del sesgo de dominio literario; aun así, un corpus centrado en Shakespeare puede reproducir estereotipos y registros arcaicos.
- No apto para uso comercial sin aclaración legal previa de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YuRiVeRTi/TEROM-DUST-1
- Repositorio del modelo (pesos safetensors y `modeling_terom.py`): https://huggingface.co/YuRiVeRTi/TEROM-DUST-1/tree/main
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
