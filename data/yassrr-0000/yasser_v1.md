# Yassrr-0000/Yasser_V1

## Resumen

Yasser V1 es un modelo de lenguaje en inglés de aproximadamente 75 millones de parámetros, entrenado desde inicialización aleatoria sobre el conjunto de datos TinyStories. Lo desarrolla el usuario Yassrr-0000 y se publica en Hugging Face como un experimento académico de un laboratorio o curso, no como un producto listo para producción. Su tarea objetivo es la finalización de historias cortas en inglés sencillo, y no ha recibido ajuste por instrucciones ni alineamiento, por lo que no debe emplearse como chatbot de propósito general.

La arquitectura es un decoder tipo Llama con atención causal de consultas agrupadas (GQA), RoPE, RMSNorm, SwiGLU y embeddings de entrada y salida atados. Cuenta con 24 capas, dimensión oculta de 512, 8 cabezas de atención (4 cabezas KV), tamaño intermedio de 1408 y un vocabulario de 8192 tokens. La longitud de contexto es de solo 256 tokens, fijada por las limitaciones de memoria de una única GPU T4 durante el entrenamiento.

Su relevancia es fundamentalmente didáctica: documenta con detalle las decisiones de arquitectura, el presupuesto de cómputo según leyes de escala, la configuración del entrenamiento y las métricas de validación. El checkpoint publicado corresponde a la actualización 10.000 de un plan de 12.208, interrumpido por los límites de uso de Colab, y solo se reporta pérdida de entropía cruzada de 1,8051 (perplejidad 6,0804) sobre un subconjunto fijo de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Llama (causal, GQA, RoPE, RMSNorm, SwiGLU) |
| Parametros totales | 74.998.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura decoder-only de estilo Llama con atención causal de consultas agrupadas: 8 cabezas de consulta comparten claves y valores entre 4 cabezas KV, lo que reduce los parámetros de proyección KV. Emplea RoPE para la codificación posicional, RMSNorm para la normalización, SwiGLU como activación en la MLP y conexiones residuales. Los embeddings de entrada y salida están atados, y el vocabulario se limita a 8192 entradas mediante un tokenizador BPE a nivel de byte ajustado únicamente sobre las historias de entrenamiento. No utiliza pesos preentrenados de Meta Llama.

El entrenamiento se realizó sobre 300.000 historias únicas y no vacías del split de entrenamiento de TinyStories (semilla 42), divididas en 90 % entrenamiento, 5 % validación y 5 % test, con normalización de espacios y eliminación de duplicados exactos mediante SHA-256. Las historias se empaquetaron en bloques no solapados de 256 tokens con EOS tras cada historia, de modo que la atención puede cruzar fronteras entre historias dentro de un mismo bloque. Se usó AdamW con learning rate pico de 0,0003, betas (0,9, 0,95), weight decay 0,1, tamaño de microbatch 8 con acumulación de 2 (batch efectivo de 16 secuencias), warm-up de 367 actualizaciones y decaimiento coseno, precisión FP16 con autocast y checkpointing de gradientes sobre una única NVIDIA T4. El presupuesto práctico solicitado era de 50 millones de tokens, pero solo se procesaron 40.964.096 tokens de entrada (40.804.080 objetivos puntuados), muy por debajo del presupuesto de referencia de 20N (aproximadamente 1.500 millones de tokens). La ejecución se interrumpió en la actualización 10.000 de las 12.208 planificadas.

## Capacidades

- Generación y finalización de historias cortas en inglés sencillo, su única tarea entrenada.
- Modelado de lenguaje autorregresivo con decodificación greedy o por muestreo.
- Manejo de vocabulario infantil y estructuras narrativas simples propias de TinyStories.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking), visión, audio ni otras modalidades.
- Multilingüismo limitado al inglés; no se documenta soporte de otros idiomas.
- No está ajustado por instrucciones ni alineado, por lo que no responde de forma fiable a comandos.

## Casos de uso

- Generación de cuentos infantiles sintéticos: el modelo puede completar historias breves a partir de una frase inicial, aprovechando su entrenamiento específico en TinyStories para producir narrativas simples con vocabulario controlado.
- Aumento de datos para experimentos de NLP: sirve para generar corpus sintéticos de historias cortas en inglés que alimenten pipelines de investigación sobre modelos pequeños o sobre calidad de datos.
- Docencia y prácticas de entrenamiento: su model card detallada y su tamaño reducido lo hacen útil como ejemplo reproducible de entrenamiento desde cero, cálculo de leyes de escala y evaluación con perplejidad.
- Pruebas de infraestructura de inferencia: con 75 millones de parámetros y pesos safetensors, es adecuado para validar despliegues con transformers o text-generation-inference en entornos con recursos limitados.
- Investigación sobre tokenizadores: permite estudiar el efecto de un vocabulario BPE pequeño (8192) y de embeddings atados en la calidad de generación de un modelo de menos de 100 millones de parámetros.
- Experimentos de empaquetado de secuencias: al concatenar historias en bloques de 256 tokens con atención cruzada entre ellas, sirve para analizar cómo afecta el empaquetado a la coherencia narrativa en modelos pequeños.
- Comparación de curvas de aprendizaje: su checkpoint intermedio (actualización 10.000) y sus métricas de validación permiten estudiar el efecto de un presupuesto de tokens insuficiente frente al presupuesto de referencia.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pérdida de entropía cruzada (validación, subconjunto fijo de 160 secuencias) | 1,8051 |
| Perplejidad, exp(loss) | 6,0804 |
| Tokens de entrada procesados | 40.964.096 |
| Objetivos de siguiente token puntuados | 40.804.080 |
| Cómputo aproximado real (6ND) | 1,8433e+16 FLOPs |
| Actualizaciones guardadas | 10.000 de 12.208 planificadas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que estos resultados no establecen una capacidad amplia de modelo de lenguaje y que no se reportan puntuaciones completas de validación ni de test.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 (unos 150 MB de pesos más overhead de activaciones y caché KV para 256 tokens), y menos aún en cuantizaciones de 8 o 4 bits, aunque el autor no documenta variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizó en una NVIDIA T4 de aproximadamente 15 GB.
- Cabe holgadamente en GPU consumer como RTX 3060, RTX 4060, RTX 4090 o incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repositorio) y endpoints compatibles; llama.cpp u Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yasser V1 | 74.998.272 | 256 | Desde cero sobre TinyStories | no disponible | Hugging Face |
| TinyLlama-1.1B | 1.100 millones | 2048 | Desde cero sobre corpus amplio (aproximado, no verificado en la información disponible) | no disponible en la información proporcionada | Hugging Face |
| Modelos TinyStories de referencia (p. ej., variantes de 1M a 33M del paper original) | 1-33 millones | no disponible | Desde cero sobre TinyStories | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; no se han publicado resultados de benchmarks comparables para este checkpoint.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado para completar historias en inglés sencillo; no es un chatbot ni un asistente de propósito general.
- No está ajustado por instrucciones ni alineado, por lo que puede ignorar comandos o producir continuaciones incoherentes fuera del dominio narrativo.
- La longitud de contexto es de solo 256 tokens, lo que limita la coherencia en textos largos y provoca pérdida de contexto en conversaciones multi-turno.
- El entrenamiento se interrumpió antes de completar el presupuesto planificado (40,9 millones de tokens frente a 50 millones solicitados y 1.500 millones de referencia), por lo que la calidad es inferior a la esperable con el presupuesto completo.
- Riesgo de alucinación y de generar contenido sin sentido fuera del estilo de TinyStories; no se han evaluado sesgos de forma sistemática.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial; debe tratarse como restringida hasta que el autor la especifique.
- El dataset TinyStories tiene licencia CDLA-Sharing-1.0, lo que puede imponer condiciones adicionales sobre los datos de entrenamiento.
- Solo se reporta evaluación sobre un subconjunto fijo de validación de 160 secuencias; no hay puntuaciones completas de validación ni de test, por lo que las métricas no son representativas del rendimiento global.
- El checkpoint publicado corresponde a la actualización 10.000 de 12.208, con una única actualización omitida; no se garantiza la reproducibilidad exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yassrr-0000/Yasser_V1
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
