# the-shop/MLXFW-Qwen3.8-Flash-Next-Heretic-MLX-8bit

## Resumen

MLXFW-Qwen3.8-Flash-Next-Heretic-MLX-8bit es una cuantizacion afina de 8 bits en formato MLX del modelo trohrbaugh/Qwen3.8-Flash-Next-heretic, a su vez una derivacion "decensored" (mediante abliteration, tecnica Heretic) del Qwen/Qwen3.8-Flash-Next original. Lo publica el usuario the-shop y esta pensado exclusivamente para ejecutarse en Apple Silicon mediante TensorFold, un runtime MLX con gestion de expertos en SSD. El checkpoint conserva la cabeza MTP (multi-token prediction) pero descarta la torre de vision: es un modelo solo de texto.

Se trata de un modelo de arquitectura MoE (mixture of experts) con aproximadamente 179.550 millones de parametros totales segun los pesos en safetensors, empaquetado en 45 shards que suman 194,1 GB. La cuantizacion es asimetrica por componentes: lineales, embeddings y expertos en 8 bits con grupos de 64, tablas n-gram en 8 bits con grupos de 32 y routers en bf16. El objetivo declarado es permitir la inferencia de un modelo de esta escala en un unico Mac con 128 GB de RAM (M5), haciendo streaming de expertos desde el SSD interno hacia un pool fijo en memoria.

Su relevancia actual es doble: por un lado, demuestra tecnicas de despliegue (prefill layer-major, snapshots de prompt a prueba de fallos, cache de paginas seguro) que reducen drasticamente el trafico de expertos desde disco; por otro, al estar abliterado, elimina los rechazos del modelo original, lo que lo hace inadecuado para exposicion directa a usuarios finales. La licencia es qwen-community-1.0 (etiquetada como "other" en Hugging Face).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con cabeza MTP; transformer con expertos dispersos; sin torre de vision |
| Parametros totales | 179.551.050.403 (~179,55 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 77.824 tokens en la configuracion medida (el runtime admite otros valores, p. ej. 16.384 en el preset ligero) |
| Tipos de cuantizacion | 8 bits afina (MLX): lineales, embeddings y expertos en grupos de 64; tablas n-gram en grupos de 32; routers en bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiqueta "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX), 45 shards, 194,1 GB de repo |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un transformer con capas de mezcla de expertos (MoE) y una cabeza de prediccion multi-token (MTP), que en este checkpoint se conserva. La derivacion Heretic aplica abliteration sobre el modelo original para eliminar el comportamiento de rechazo; el autor no documenta el procedimiento exacto ni el volumen de datos usado en ese proceso. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original dentro de la informacion proporcionada.

La innovacion tecnica relevante esta en el runtime TensorFold v0.3.0, no en el modelo: prefill layer-major (los fragmentos de prompt atraviesan cada capa como grupo, llenando la ventana de expertos una vez por capa y grupo en lugar de una vez por capa y fragmento), lecturas de expertos seguras para la cache de paginas (evitan dejar decenas de GB en page cache), reutilizacion de expertos del pool de decodificacion durante el prefill, snapshots de prompt con version de numericas y prompt canario, y un perfilador de decodificacion opcional. El checkpoint usa anchura de experto 640, que compila sin cambios en el kernel de bajada.

## Capacidades

- Generacion de texto conversacional y continuacion de texto (pipeline text-generation).
- Razonamiento multi-paso con modo "thinking" (activado por defecto en el preset medido del runtime).
- Prediccion multi-token mediante la cabeza MTP incluida en el checkpoint.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes: no documentado; el runtime ofrece persistencia de turnos y checkpoints del ultimo mensaje de usuario, utiles para sesiones largas.
- Vision: no incluida (la torre de vision fue eliminada en esta cuantizacion).
- Audio: no disponible.
- Al estar abliterado, responde a peticiones que el modelo original rechaza, incluidas las daninas.

## Casos de uso

- Inferencia local en Apple Silicon de gran escala: ejecutar un MoE de ~179,5 mil millones de parametros en un Mac M5 de 128 GB con streaming de expertos desde SSD, para investigacion y experimentacion sin depender de GPUs de datacenter.
- Evaluacion de tecnicas de despliegue: banco de pruebas para medir prefill layer-major, reutilizacion de expertos y gestion de cache de paginas con prompts largos (24K tokens en las mediciones del autor).
- Generacion de texto creativo sin restricciones de contenido: el modelo cumple peticiones que el original rechaza; util en entornos controlados de investigacion sobre comportamiento de modelos abliterados.
- Asistentes conversacionales de contexto largo: con 77.824 tokens de ventana y persistencia de turnos, adecuado para conversaciones multi-turno con documentos extensos en local.
- Analisis y resumen de documentacion tecnica en local: procesar prompts largos manteniendo los datos en la maquina, sin salida a la nube.
- Investigacion sobre alineacion y seguridad: comparar respuestas del modelo original frente a la version Heretic para estudiar el efecto de la abliteration en el comportamiento de rechazo.
- Prototipado de pipelines de razonamiento con modo thinking: validar flujos multi-paso antes de migrar a infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta metricas de sistema del runtime TensorFold v0.3.0 medidas el 2026-10-12 sobre este checkpoint:

| Metrica | Valor |
|---|---|
| Pool de expertos en RAM | 60 GiB |
| Limite de memoria del proceso | 84 GiB |
| Contexto configurado | 77.824 tokens |
| Huella maxima del proceso | ~88 GB |
| Lectura de expertos en prompt frio de 24K tokens (v0.3.0, layer-major) | 135,9 GB |
| Lectura de expertos en prompt frio de 24K tokens (version anterior) | 1.452,1 GB |
| Paginas de expertos retenidas en page cache tras prompt frio de 24K | ~25 MB (frente a ~18 GB antes) |

## Requisitos de hardware

- VRAM/RAM estimada: el preset medido requiere un Mac con 128 GB de RAM unificada y deja unos 40 GB libres; el proceso alcanza ~88 GB de huella. Preset ligero: limite de 76 GB y contexto de 16.384 (o pool de 40 GB y limite de 56 GB para mas RAM libre).
- GPU recomendadas: Apple Silicon M5 con 128 GB de memoria unificada. No hay soporte documentado para A100, H100 ni RTX 4090 con este formato MLX.
- Cabe en GPU de consumo: no en el sentido habitual; requiere un Mac de gama alta con 128 GB unificados. No cabe en RTX 4090 (24 GB) ni en configuraciones equivalentes.
- Almacenamiento: ~220 GB de SSD libre (194 GB de pesos mas snapshots de prompt y sesion, que crecen con `--persist-turns`).
- Opciones de despliegue: TensorFold v0.3.0 (fork de the-shop sobre ashhart/TensorFold v0.3.6.3), con servidor compatible con la API OpenAI chat-completions en `http://127.0.0.1:8080`. Otros cargadores MLX no estan probados. El preset medido arranca en `127.0.0.1:8131` mediante el script `launch/run-tensorfold.sh`.
- Latencia y throughput: no disponibles; el autor no publica tokens por segundo en la informacion proporcionada.
- Software: Python 3.11 o superior, Xcode Command Line Tools, extras `tensorfold[ssd]` (compilan una extension nativa con cmake y nanobind la primera vez).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MLXFW-Qwen3.8-Flash-Next-Heretic-MLX-8bit (este) | ~179,55 mil millones | 77.824 tokens (config. medida) | MLX safetensors 8 bits | qwen-community-1.0 | Hugging Face, 198 descargas |
| trohrbaugh/Qwen3.8-Flash-Next-heretic (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: el comportamiento de rechazo fue eliminado; cumplira peticiones que el original rechaza, incluidas las daninas. El autor no realizo ninguna evaluacion de seguridad.
- No debe exponerse a usuarios finales sin salvaguardas propias; la responsabilidad de uso y del cumplimiento legal recae en el desplegador.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue.
- Restricciones de licencia: qwen-community-1.0 con terminos especificos; revisar el archivo LICENSE antes de uso comercial.
- Compatibilidad limitada: solo probado con TensorFold v0.3.0 en Mac M5 de 128 GB; otros cargadores MLX no estan verificados.
- Requisitos de almacenamiento elevados (~220 GB de SSD) y huella de memoria de ~88 GB, por encima del objetivo de 60-80 GB del autor.
- La cabeza MTP esta incluida, pero la torre de vision no: no admite entradas de imagen.
- Etiquetado `not-for-all-audiences`: contenido potencialmente inapropiado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/the-shop/MLXFW-Qwen3.8-Flash-Next-Heretic-MLX-8bit
- Modelo base: https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime TensorFold (fork de the-shop): https://github.com/the-shop/TensorFold
- TensorFold original (ashhart): https://github.com/ashhart/TensorFold
- Version v0.3.6.3 de TensorFold: https://github.com/ashhart/TensorFold/tree/v0.3.6.3
- Repositorio de scripts de lanzamiento: https://github.com/the-shop/mlxfw-qwen38-flashnext-q8
