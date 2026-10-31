# Studio-Research-M1/Feyospace-s1-obliterated-oQ4e-FP16-MTP-MLX

## Resumen

Feyospace s1 obliterated (oQ4e · FP16 · MTP) es una cuantización mixta para Apple Silicon del modelo OBLITERATUS/feyospace-s1-obliterated, una variante "abliterada" (sin filtros de rechazo) orientada a ciberseguridad del modelo base feyospace/feyospace-v1.1-small, de 28 mil millones de parámetros y arquitectura Qwen3.5. Esta versión concreta, publicada por Studio-Research-M1, corresponde a la cuantización oQ4e (4 bits, 18,0 GB en disco) y es la más ligera y rápida de una familia de tres builds (oQ4e, oQ6e y oQ8e).

Su relevancia radica en tres decisiones técnicas: se conservan las escalas y tensores de texto no cuantizados en FP16 (ya que las GPU de los chips M1 carecen de BF16 hardware), se mantiene la cabeza MTP (multi-token prediction) de 29 tensores para habilitar decodificación especulativa en motores compatibles como oMLX Lightning MTP, y se preservan los 333 tensores de la torre de visión en FP32, lo que permite inferencia multimodal imagen-texto. El autor reporta una KLD media frente al modelo BF16 de 0,0266 para esta variante oQ4e, con perplejidad y KLD finitas sobre las 32.768 posiciones evaluadas de WikiText-2.

Al tratarse de un modelo abliterado y sin censura, orientado a ciberseguridad, está pensado para investigadores y profesionales que necesitan respuestas sin rechazos de seguridad en tareas de análisis de vulnerabilidades, malware o explotación, con la responsabilidad ética y legal que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (multimodal imagen-texto, con cabeza MTP) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits mixto: escalas y tensores de texto no cuantizados en FP16, torre de vision en FP32, cabeza MTP cuantizada) |
| Idiomas soportados | ingles (según model card; el modelo base Qwen3.5 suele ser multilingue, pero no consta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base es feyospace-v1.1-small, de 28B de parametros y arquitectura Qwen3.5, un transformer multimodal con torre de vision (pipeline image-text-to-text). Sobre el se aplico una abliteracion orientada a ciberseguridad, es decir, una modificacion de los pesos destinada a eliminar los mecanismos de rechazo del modelo sin necesidad de reentrenamiento completo. Sobre esa variante abliterada, Studio-Research-M1 construyo esta cuantizacion oQ, con precision mixta: los tensores de texto no cuantizados (escalas, sesgos) van en FP16 en lugar de BF16, decision motivada por la ausencia de BF16 hardware en las GPU de los chips Apple M1 de primera generacion. La torre de vision se mantiene en FP32 (333 tensores) y la cabeza MTP se conserva cuantizada (29 tensores).

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO para el modelo base. La innovacion destacable de este repo es la conservacion de la cabeza MTP para decodificacion especulativa: en motores que la soportan (oMLX Lightning MTP), el modelo puede predecir varios tokens por paso y acelerar la generacion, especialmente en codigo. El autor reporta validacion empirica de la cuantizacion: perplejidad y KLD finitas sobre las 32.768 posiciones puntuadas de WikiText-2, sin salidas degeneradas (`!!!!`) en las pruebas de humo.

## Capacidades

- Generacion de texto conversacional, con sesgo tematico hacia ciberseguridad por la abliteracion aplicada.
- Comprension de imagen y texto (pipeline image-text-to-text): los pesos de la torre de vision se conservan, aunque el autor no ha evaluado las capacidades visuales de esta cuantizacion.
- Generacion y analisis de codigo: la variante oQ4e se promociona como la mas rapida en codigo gracias al MTP activo.
- Decodificacion especulativa mediante la cabeza MTP conservada, funcional de serie en motores compatibles (oMLX Lightning MTP).
- Respuestas sin rechazos de seguridad (abliterada/uncensored): no aplica filtros de alineacion en temas de seguridad ofensiva y defensiva.
- Soporte de tool calling: no disponible (no consta en la informacion proporcionada).
- Capacidades de agentes o razonamiento multi-paso: no disponible (no consta en la informacion proporcionada).

## Casos de uso

- Analisis de vulnerabilidades y revision de codigo ofensivo/defensivo: al ser un modelo abliterado orientado a ciberseguridad, puede razonar sobre exploits, payloads y tecnicas de ataque sin rechazar la peticion; adecuado para red teams y auditorias.
- Ingenieria inversa y analisis de malware: permite discutir comportamientos de binarios, ofuscacion y tecnicas de evasion, tareas que los modelos alineados suelen bloquear.
- Generacion de codigo en local sobre Apple Silicon: con la cabeza MTP activa y la cuantizacion de 4 bits, es la variante mas rapida de la familia para autocompletado y refactorizacion de codigo en portatiles M1/M1 Pro/M1 Max.
- Chatbot tecnico sin filtros para investigacion: util como base para estudiar el efecto de la abliteracion en la utilidad y los sesgos del modelo.
- Procesamiento de documentos con imagenes: al conservar la torre de vision, en teoria puede aceptar capturas de pantalla, diagramas o informes visualmente ricos como entrada, aunque el autor advierte de posibles problemas con los ficheros de procesador y no ha evaluado esta via.
- Evaluacion de cuantizaciones oQ: sirve como caso de estudio comparativo frente a oQ6e y oQ8e para medir el impacto de la precision en KLD y perplejidad sobre Apple Silicon de primera generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de evaluacion aportados por el autor son de calidad de cuantizacion, no de capacidad:

| Metrica | Valor |
|---|---|
| KLD media vs BF16 (oQ4e) | 0,0266 |
| KLD media vs BF16 (oQ6e) | no disponible |
| KLD media vs BF16 (oQ8e) | 0,00161 |
| Posiciones WikiText-2 evaluadas | 32.768 (perplejidad y KLD finitas) |
| Salidas degeneradas en pruebas de humo | ninguna (`!!!!` ausente) |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 18,0 GB, por lo que se recomienda un Mac con al menos 24 GB de memoria unificada para dejar margen al contexto y al sistema; idealmente 32 GB o mas.
- Hardware objetivo: chips Apple Silicon M1, M1 Pro y M1 Max (optimizado en primera instancia). El autor anuncia builds con escalas BF16 para chips M2 a M5. No es un modelo para GPU NVIDIA en este formato MLX.
- Consumer hardware: cabe en Macs de consumo con memoria unificada suficiente (24-32 GB); no aplica a tarjetas graficas convencionales al tratarse de un build MLX.
- Despliegue: oMLX (con soporte Lightning MTP para decodificacion especulativa), LM Studio y `mlx_lm.load` de la libreria mlx-lm.
- Latencia y throughput: no se han publicado cifras concretas; el autor indica que oQ4e es la variante mas rapida de las tres y la mas veloz en codigo con MTP activado, pero sin numeros.

## Comparativa con modelos similares

Comparativa entre las tres variantes de la misma familia publicadas por el autor:

| Variante | Tamano del repo | KLD vs BF16 | MTP | Perfil |
|---|---|---|---|---|
| oQ4e (esta ficha) | 18,0 GB | 0,0266 | Activado | Mas rapida y ligera; eleccion por defecto, maxima velocidad en codigo |
| oQ6e | 24,6 GB | no disponible | Desactivado | Punto medio |
| oQ8e | 30,9 GB | 0,00161 | Activado | Maxima fidelidad al BF16, mejor seguimiento de instrucciones |

Comparativa con alternativas externas: no disponible. No constan modelos comparables publicados con datos suficientes (cuantizaciones MLX oQ de otros modelos 28B abliterados con MTP) en la informacion proporcionada, y el modelo base feyospace-v1.1-small carece de datos publicos de benchmarks en esta ficha.

## Limitaciones y advertencias

- Abliterado y sin censura: el modelo no rechaza peticiones sobre ciberataque, malware o explotacion. Su uso puede ser ilegal o eticamente inaceptable en muchos contextos; es responsabilidad del usuario cumplir la ley aplicable. No desplegar en productos orientados a publico general.
- Riesgo de alucinacion: no evaluado por el autor; al tratarse de una cuantizacion agresiva de 4 bits sobre un modelo abliterado, cabe esperar mayor tasa de errores factuales que en el modelo BF16 original, aunque la KLD reportada (0,0266) sugiere fidelidad razonable.
- Vision sin evaluar: los pesos de la torre de vision se conservan, pero el autor no ha evaluado las capacidades multimodales y advierte de una posible incompatibilidad con los ficheros de procesador; la funcionalidad imagen-texto puede requerir ajustes manuales.
- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta documentado.
- Contexto: la longitud de ventana de contexto no se especifica en la model card.
- Formato especifico de plataforma: es un build MLX para Apple Silicon; no sirve directamente para CUDA, vLLM, TGI o llama.cpp en su formato actual.
- Licencia: Apache 2.0, permisiva para uso comercial, pero las licencias del modelo base y de la abliteracion intermedia (OBLITERATUS/feyospace-s1-obliterated) deben verificarse por el usuario.
- Trazabilidad: el modelo procede de una cadena de derivados (base → abliterado → cuantizado); conviene auditar el comportamiento antes de cualquier uso serio, dado el bajo numero de descargas (23) y la ausencia de evaluaciones independientes.

## Enlaces

- Repositorio de esta ficha (oQ4e): https://huggingface.co/Studio-Research-M1/Feyospace-s1-obliterated-oQ4e-FP16-MTP-MLX
- Variante oQ6e: https://huggingface.co/Studio-Research-M1/Feyospace-s1-obliterated-oQ6e-FP16-MTP-MLX
- Variante oQ8e: https://huggingface.co/Studio-Research-M1/Feyospace-s1-obliterated-oQ8e-FP16-MTP-MLX
- Coleccion completa de la familia: https://huggingface.co/collections/Studio-Research-M1/feyospace-s1-obliterated-28b-oq-mlx-apple-silicon-6ae4d395d2f87e2ae7ec4e5d
- Modelo abliterado base de la cuantizacion: https://huggingface.co/OBLITERATUS/feyospace-s1-obliterated
- Modelo original feyospace-v1.1-small: https://huggingface.co/feyospace/feyospace-v1.1-small
