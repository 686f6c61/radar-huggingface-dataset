# VeroLM/NoTokenLM-Gen-3.5-Focused

## Resumen

NoTokenLM-Gen-3.5-Focused es un modelo de lenguaje de 9,05 millones de parámetros desarrollado por VeroLM (publicado también bajo la cuenta `omurberaisik` en Hugging Face) que opera a nivel de byte, sin tokenizador. Se trata de un ajuste fino por continuación sobre el checkpoint NoTokenLM-Gen-3.5, no de una arquitectura nueva: mismos pesos, misma configuración (RoPE, RMSNorm, SwiGLU, weight tying, vocabulario de 256 valores correspondientes a los bytes UTF-8 crudos). Su objetivo es corregir la principal debilidad de su predecesor, la coherencia a larga distancia, y el autor reporta una mejora de aproximadamente el 38-42 % de generaciones plenamente coherentes a aproximadamente el 86 % en una evaluación manual.

La relevancia del modelo es fundamentalmente experimental y educativa: demuestra que un transformer diminuto entrenado desde cero a nivel de byte puede producir morfología de palabras real, formato de diálogo y gramática de corto alcance sin tokenizador alguno. El ajuste "Focused" se realizó con un dataset restringido exclusivamente a TinyStories, tras comprobar que una mezcla previa de c4, matemáticas y datos sintéticos inyectaba un registro de "problema de palabras" en prompts no relacionados.

No es un modelo de chat ni de seguimiento de instrucciones: no ha visto datos en formato pregunta-respuesta y debe alimentarse con el inicio de una frase, no con una pregunta. No tiene capacidad aritmética ni conocimiento factual fiable. El estilo ha virado hacia una narrativa más simple y de frases cortas, cercana a la estructura de cuento infantil, en comparación con el registro más literario del Gen-3.5 base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, RMSNorm, SwiGLU y weight tying; nivel de byte sin tokenizador |
| Parametros totales | 9.055.440 (9.053.520 en los safetensors del repo; la diferencia son las cabeceras auxiliares de supervisión profunda usadas solo en entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, con `trust_remote_code=True` y código personalizado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9 millones de parámetros con normalización RMSNorm, activación SwiGLU, embeddings posicionales rotatorios (RoPE) y atado de pesos entre la capa de entrada y la de salida. La peculiaridad central es el vocabulario: 256 valores que corresponden directamente a los bytes UTF-8, de modo que la codificación y decodificación se reducen a `str.encode("utf-8")` y `bytes.decode("utf-8")`, sin objeto tokenizador. El checkpoint se entrenó desde cero y emplea cabeceras auxiliares de supervisión profunda durante el entrenamiento, descartadas en los pesos publicados.

El ajuste "Focused" es una continuación corta sobre el checkpoint Gen-3.5 (actualizada por última vez en el paso 45.600, sesión número 9, el 19 de agosto de 2026). El dataset de esta fase es exclusivamente TinyStories, elegido para reforzar el seguimiento del sujeto y la estructura de relato corto tras detectar que una mezcla anterior de c4, matemáticas y datos sintéticos contaminaba los prompts con un registro de problema matemático. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto narrativo en inglés a nivel de byte, sin tokenizador.
- Morfología de palabras real y gramática de corto alcance.
- Formato de diálogo (comillas, atribuciones del tipo "He said to his mom").
- Seguimiento del sujeto y de pronombres a lo largo de dos o tres frases (she/she, he/he, his/his), que era el principal punto de fallo del predecesor.
- Estructura de relato corto con inicio, desarrollo y cierre simple.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo inglés.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- No tiene capacidad aritmética fiable ni conocimiento factual del mundo.

## Casos de uso

- Investigación sobre modelos sin tokenizador: permite estudiar el comportamiento de un transformer a nivel de byte con un coste computacional mínimo, comparando directamente con arquitecturas basadas en BPE o SentencePiece.
- Docencia y divulgación: un modelo de 9 millones de parámetros que cabe en cualquier portátil sirve para ilustrar de forma tangible conceptos como RoPE, RMSNorm, SwiGLU o el atado de pesos sin necesidad de infraestructura.
- Generación de microrrelatos y cuentos infantiles: el ajuste sobre TinyStories produce narrativa simple y coherente en frases cortas, adecuada para prototipos de contenido infantil o demos de generación literaria.
- Pruebas de concepto de despliegue en el edge: sus dimensiones permiten ejecutarlo en CPU o en GPU de gama baja para validar pipelines de inferencia antes de escalar a modelos mayores.
- Evaluación de coherencia a larga distancia: sirve como banco de pruebas controlado para medir el seguimiento de sujeto y pronombres en generaciones de dos a tres frases, con un fallo documentado de aproximadamente el 14 %.
- Generación de datos sintéticos de texto simple: puede utilizarse para producir corpus narrativos breves en inglés destinados a experimentos de aumento de datos o a la evaluación de otros modelos pequeños.
- Comparación de registros estilísticos: al coexistir con el Gen-3.5 base, permite contrastar el tono de novela decimonónica frente al de cuento infantil en un mismo esqueleto arquitectónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor reporta únicamente una evaluación manual de coherencia:

| Metrica | Gen-3.5 (predecesor) | Gen-3.5-Focused |
|---|---|---|
| Generaciones plenamente coherentes | ~38-42 % (100 prompts) | ~86 % (200 generaciones, 10 prompts reservados, temperatura 0,6) |
| Generaciones con deriva o contradicción | no disponible | ~14 % (aproximadamente 1 de cada 7) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (9,05 millones de parámetros a 4 bytes por parámetro, unos 36 MB de pesos) y alrededor de 18 MB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problemas y en cualquier GPU (RTX 3060, RTX 4090, A100, H100) sin aprovechar su capacidad.
- Cabe en cualquier GPU consumer, incluida la gama de entrada, y en dispositivos integrados.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el repositorio incluye un notebook para ejecución directa en Colab. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el código personalizado y la ausencia de tokenizador complican su integración en esos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoTokenLM-Gen-3.5-Focused | 9,05 M | no disponible | Byte-level sin tokenizador, TinyStories | Apache 2.0 | Hugging Face |
| NoTokenLM-Gen-3.5 | no disponible | no disponible | Byte-level sin tokenizador, mezcla c4/math/synth | Apache 2.0 | Hugging Face |
| NoTokenLM-Gen-2.5 | ~3,1 M | no disponible | Estilo GPT-2 (GELU, LayerNorm, embeddings posicionales aprendidos) | no disponible | Hugging Face |

La comparación con modelos de la misma categoría fuera de la familia NoTokenLM no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni de seguimiento de instrucciones: no ha visto datos de pregunta-respuesta y responde peor a preguntas directas que a inicios de frase.
- Alrededor del 14 % de las generaciones todavía derivan o se contradicen, incluyendo casos de contradicción del sujeto dentro de la misma frase ("The old man was a girl").
- Sin capacidad aritmética fiable: el checkpoint actual trata los prompts con forma matemática como inicios de relato.
- Sin conocimiento factual ni del mundo fiable; el riesgo de alucinación es estructural, no un defecto corregible mediante prompting.
- Solo inglés; no se documenta soporte de otros idiomas.
- La longitud de contexto no está especificada, lo que impide planificar su uso en escenarios de contexto largo.
- El estilo ha virado hacia narrativa simple de frases cortas; para un registro más literario debe usarse el Gen-3.5 base.
- Licencia Apache 2.0, que permite uso comercial, pero la ausencia de capacidades de instrucción y de conocimiento factual limita severamente su aplicabilidad en producción más allá de demos y experimentación.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código del repositorio antes de desplegarlo en entornos sensibles.
- El repositorio figura con un tamaño de 0,0 GB y 83 descargas, lo que sugiere un proyecto de investigación con poca validación externa.

## Enlaces

- Hugging Face (VeroLM): https://huggingface.co/VeroLM/NoTokenLM-Gen-3.5-Focused
- Hugging Face (cuenta alternativa del autor): https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.5-Focused
- Modelo predecesor NoTokenLM-Gen-3.5: https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.5
