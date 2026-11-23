# vatsonai/pusmogo-cleanup-hu-001

## Resumen

Pusmogo cleanup HU 001 es un ajuste fino completo de `swiss-ai/Apertus-v1.1-0.5B-Instruct` (438.349.312 parametros) desarrollado por vatson.ai. Su unica tarea es la correccion de transcripciones automaticas de hungaro: recibe la salida de un reconocedor de voz y devuelve un texto limpio, corrigiendo palabras mal oidas, sufijos, ortografia y puntuacion, y eliminando muletillas, repeticiones y autocorrecciones. El modelo esta entrenado especificamente sobre los errores del reconocedor Pusmogo HU 001, tambien de vatson.ai.

Se trata de una publicacion de investigacion con etiqueta `experimental` y el propio autor advierte que la aplicacion Pusmogo no lo utiliza. En texto hablado real empeora la tasa de error de palabras (WER) si se aplica sin proteccion: 11,7 % a 13,3 % en Common Voice y 15,2 % a 16,7 % en pseudo-susurrado. Solo mejora en errores sinteticos escritos a mano (9,4 % a 7,2 %). Con una guarda externa que acepta unicamente cambios de puntuacion, mayusculas y ortografia de palabras desconocidas para Hunspell, la mejora es marginal en habla (11,73 % a 11,48 %).

El interes tecnico del modelo es acotado: demuestra el comportamiento de un ajuste fino de 0,5B sobre una tarea de reescritura muy estrecha y documenta de forma inusualmente honesta sus fallos (eliminacion de palabras y sustitucion de nombres propios). No es un modelo de proposito general ni un corrector desplegable sin supervision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Apertus-v1.1-0.5B-Instruct) |
| Parametros totales | 438.349.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en bfloat16; ajuste realizado en 32 bits; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Hungaro (hu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Apertus-v1.1-0.5B-Instruct, desarrollado por el Instituto Nacional Suizo de IA (ETH Zurich y EPFL). El ajuste fino fue completo: 5.000 pasos, tamano de lote 8, tasa de aprendizaje 2e-5, sobre todas las capas excepto los embeddings de tokens, que se mantuvieron congelados como en el modelo base. El entrenamiento se realizo en 32 bits con `mlx-lm`; los pesos publicados estan en bfloat16.

El conjunto de entrenamiento consta de dos bloques. El primero contiene 14.825 pares salida de Pusmogo HU 001 hacia la frase original leida, extraidos de Common Voice Hungarian 27.0 (CC0-1.0) con clips no usados para entrenar Pusmogo HU, de los cuales 4.122 son copias pseudo-susurradas. El segundo aporta 8.000 pares de frase limpia con errores, muletillas, repeticiones y autocorrecciones generados por reglas hacia la frase limpia, usando frases de Common Voice y FineWeb-2 Hungarian (ODC-By 1.0). No se emplearon grabaciones privadas, de clientes ni de la aplicacion. El modelo se entreno con un system prompt fijo en hungaro que define la tarea y las reglas de tratamiento de anglicismos empresariales.

## Capacidades

- Reescritura de texto hungaro: correccion de palabras mal transcritas, sufijos, ortografia y puntuacion.
- Eliminacion de muletillas, repeticiones y fragmentos autocorregidos en transcripciones.
- Preservacion de anglicismos de negocio (deadline, meeting, feedback) con sufijacion hungara correcta segun las reglas indicadas en el prompt.
- Generacion de texto conversacional basica heredada del modelo base, con plantilla de chat y opcion `enable_thinking=False`.
- No soporta vision, audio ni tool calling de forma documentada.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- Monolingue: solo hungaro.

## Casos de uso

- Postprocesado de dictado con revision humana: aplicar el modelo a la salida de un ASR hungaro y validar manualmente el resultado, especialmente en frases con nombres, cifras o terminologia legal o medica, donde el autor advierte de fallos.
- Limpieza de borradores escritos con errores tipificados: el modelo rinde mejor en errores sinteticos (WER 9,4 % a 7,2 %), por lo que encaja en la normalizacion de textos con faltas, repeticiones o autocorrecciones mecanografiadas.
- Investigacion sobre correccion de ASR de bajo coste: sirve como referencia reproducible de ajuste fino de un modelo de 0,5B sobre errores de un reconocedor concreto, con datos y metricas publicados.
- Prototipado de pipelines de limpieza con guarda: combinado con una capa de validacion tipo Hunspell que solo acepte cambios de puntuacion, mayusculas y ortografia de palabras desconocidas, puede integrarse en un flujo de prepublicacion de transcripciones.
- Generacion de pares de entrenamiento: sus salidas y errores documentados pueden usarse para construir datos de evaluacion de correctores hungaros.
- Experimentacion local en Apple Silicon: con 0,9 GB de repositorio y 0,08 s de mediana por texto en un M5 Pro, es viable para pruebas en portatil sin GPU dedicada.
- Analisis de sesgos y robustez en modelos pequenos: los fallos de eliminacion de palabras y sustitucion de nombres propios publicados por el autor permiten estudiarlos de forma controlada.

## Benchmarks y rendimiento

| Conjunto | Frases | WER antes | WER despues | Frases correctas rotas |
|---|---|---|---|---|
| Hablado (Common Voice) | 300 | 11,7 % | 13,3 % (peor) | 25 de 127 |
| Pseudo-susurrado | 200 | 15,2 % | 16,7 % (peor) | no disponible |
| Palabras mal oidas | 55 | 11,6 % | 11,4 % | no disponible |
| Errores escritos a mano | 40 | 9,4 % | 7,2 % (mejor) | 6 de 30 |

Con guarda externa (solo puntuacion, mayusculas y ortografia de palabras desconocidas para Hunspell): hablado 11,73 % a 11,48 % (6 frases mejor, 1 peor, ninguna correcta rota) y pseudo-susurrado 15,19 % a 15,25 %. La guarda no forma parte del modelo.

Rendimiento: mediana de 0,08 s por texto en 32 bits con MLX sobre Apple M5 Pro. Los pesos bfloat16 publicados se reevaluaron solo en el conjunto escrito a mano, con el mismo 7,2 % y 39 de 40 salidas identicas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 438 millones de parametros, los pesos en bfloat16 ocupan aproximadamente 0,9 GB, por lo que la inferencia completa cabe holgadamente en menos de 2 GB sumando cache de activaciones.
- GPU recomendadas: el autor solo documenta pruebas con MLX en Apple Silicon (M5 Pro). No se publican pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: por tamano, cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) y en Macs con Apple Silicon; no hay mediciones publicadas en esas plataformas.
- Despliegue: `mlx-lm` es la via documentada. No se documentan vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia: 0,08 s de mediana por texto (32 bits, MLX, Apple M5 Pro). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pusmogo cleanup HU 001 | 438.349.312 | no disponible | Correccion de ASR hungaro | Apache-2.0 | Hugging Face, solo MLX |
| swiss-ai/Apertus-v1.1-0.5B-Instruct | 0,5B (aprox.) | no disponible | Instrucciones generales | Apache-2.0 | Hugging Face |
| Pusmogo HU 001 | no disponible | no disponible | Reconocimiento de voz hungaro | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros correctores de ASR hungaros en la informacion proporcionada.

## Limitaciones y advertencias

- En texto hablado real empeora el WER (11,7 % a 13,3 % en Common Voice; 15,2 % a 16,7 % en pseudo-susurrado) y rompe 25 de 127 frases correctas.
- Elimina palabras con frecuencia: los ejemplos del autor muestran supresion de "tegnap a" y de "tojast" en enumeraciones.
- Sustituye nombres propios: "Bence" pasa a "Bencze" en el ejemplo documentado.
- No escucha el audio original; solo lee texto, por lo que no puede resolver ambiguedades acusticas.
- No debe usarse sin revision humana en importes, nombres, textos legales o medicos.
- Monolingue en hungaro; no hay soporte documentado de otros idiomas.
- Publicacion experimental: la aplicacion Pusmogo no lo utiliza.
- El modelo base incluye una Apertus Acceptable Use Policy y recomienda un filtro de datos personales en la salida; deben consultarse antes del uso.
- ETH Zurich y EPFL no han revisado ni respaldado este modelo.
- La evaluacion comparte el 84 % de hablantes con el conjunto de entrenamiento del modelo de voz, lo que limita la generalizacion de las metricas.
- Solo se ha probado con MLX en Apple Silicon; no hay validacion en otras plataformas ni en otras precisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vatsonai/pusmogo-cleanup-hu-001
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.1-0.5B-Instruct
- Reconocedor Pusmogo HU 001: https://huggingface.co/vatsonai/pusmogo-hu-001
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Sitio del autor: https://vatson.ai
