# truthcoder/TC-Mini-4B-GGUF

## Resumen

TC Mini 4B es una conversión a formato GGUF del modelo mlabonne/Qwen3-4B-abliterated, que a su vez deriva del Qwen3-4B de Alibaba. El autor, truthcoder, no ha realizado ningún ajuste fino: se limita a convertir los pesos originales con `convert_hf_to_gguf.py` de llama.cpp y a cuantizarlos con `llama-quantize`. El resultado es un modelo de 4.022.468.096 parámetros (aproximadamente 4B) pensado para inferencia local en ordenadores de sobremesa y portátiles, con soporte para GPU y Apple Silicon.

La característica definitoria es la "abliteración": el modelo base de mlabonne ha eliminado las direcciones de rechazo del Qwen3 original, de modo que el modelo no se niega a responder ante peticiones que el modelo alineado rechazaría. El autor reporta 0/8 rechazos en una prueba de ocho prompts. Esto lo orienta a usos de investigación sobre alineación, generación sin filtros y despliegue privado y offline.

La relevancia actual reside en su empaquetado: se distribuye en tres cuantizaciones (F16, Q8_0 y Q4_K_M), se integra directamente con Ollama, LM Studio y llama.cpp, y la variante Q4_K_M ocupa solo 2,50 GB, lo que permite ejecutarlo en hardware de consumo. La licencia es Apache-2.0, heredada de Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4B parámetros, heredado de Qwen3-4B. No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación del Qwen3 original (RLHF, DPO u otras técnicas). Lo que sí se documenta es la modificación posterior: mlabonne aplicó abliteración, una técnica que identifica y elimina las direcciones de activación asociadas al rechazo, de modo que el modelo pierde la tendencia a declinar peticiones.

La contribución de truthcoder es puramente de empaquetado: conversión a GGUF con el script oficial de llama.cpp y cuantización con `llama-quantize`. No hay ajuste fino adicional. El modelo conserva el modo "thinking" de Qwen3, que puede desactivarse añadiendo `/no_think` al mensaje, según indica la model card.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat compatible con Ollama y LM Studio.
- Modo de razonamiento ("thinking") heredado de Qwen3, desactivable mediante el token `/no_think`.
- Generación sin rechazos: 0/8 negativas en la prueba de ocho prompts reportada por el autor.
- Inferencia totalmente local y offline, sin envío de datos a servidores externos.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente privado en escritorio: ejecutado con Ollama o LM Studio sobre GPU o Apple Silicon, procesa conversaciones sin que ningún dato salga del equipo, adecuado para entornos con requisitos estrictos de confidencialidad.
- Investigación sobre alineación y seguridad: al carecer de direcciones de rechazo, sirve para estudiar el comportamiento de modelos sin filtros y comparar con la versión alineada de Qwen3-4B.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido que los modelos alineados suelen declinar, con la ventaja de que la cuantización Q4_K_M de 2,50 GB cabe en portátiles modestos.
- Prototipado rápido de aplicaciones conversacionales: la integración directa con `ollama run hf.co/truthcoder/TC-Mini-4B-GGUF:Q4_K_M` permite levantar un endpoint local en minutos para pruebas de integración.
- Despliegue en entornos air-gapped: al ser un único fichero GGUF con checksums SHA-256 publicados, se puede distribuir y verificar en redes aisladas sin acceso a Internet.
- Re-cuantización y experimentación: la variante F16 de 8,05 GB está pensada explícitamente para volver a cuantizar a otros formatos o niveles de precisión según las necesidades del despliegue.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece tres niveles (Q4_K_M, Q8_0, F16) que permiten medir la degradación de calidad frente al coste de memoria en un mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada por el autor es 0/8 rechazos en una prueba propia de ocho prompts, sin comparación con otros modelos ni resultados de MMLU, HumanEval, GSM8K u otros conjuntos estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M, 4,3-5 GB con Q8_0 y 8-9 GB con F16, sumando el overhead del contexto y de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050 en adelante); RTX 4090 o A100 no son necesarias y estarían sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en todas las tarjetas con 6 GB o más para Q4_K_M; la variante Q8_0 requiere unos 6-8 GB y la F16 unos 10-12 GB.
- Apple Silicon: soportado mediante Metal en llama.cpp y Ollama; un Mac con 8 GB de memoria unificada puede ejecutar Q4_K_M.
- Opciones de despliegue: Ollama (`ollama run hf.co/truthcoder/TC-Mini-4B-GGUF:Q4_K_M`), llama.cpp (`llama-cli -hf truthcoder/TC-Mini-4B-GGUF:Q4_K_M`), LM Studio (búsqueda por `truthcoder/TC-Mini-4B-GGUF`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TC Mini 4B (este) | 4,02B | no disponible | GGUF (F16/Q8_0/Q4_K_M) | Apache-2.0 | Sin rechazos, derivado de Qwen3-4B abliterado |
| mlabonne/Qwen3-4B-abliterated | ~4B | no disponible | safetensors | Apache-2.0 | Modelo base directo; requiere conversión para uso local |
| Qwen3-4B (original) | ~4B | no disponible | safetensors | Apache-2.0 | Versión alineada con rechazos; referencia de comparación |
| Qwen3-4B-GGUF (oficial) | ~4B | no disponible | GGUF | Apache-2.0 | Mismo tamaño y ecosistema, pero con alineación intacta |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de alineación: la abliteración elimina los rechazos, por lo que el modelo puede generar contenido dañino, ilegal o inexacto sin advertirlo. El autor declara explícitamente que la responsabilidad del uso recae en el usuario.
- Riesgo de alucinación: inherente a los modelos de 4B parámetros; no hay datos de evaluación que cuantifiquen este riesgo.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable fuera del inglés o el chino sin evaluación previa.
- Longitud de contexto no disponible: impide planificar despliegues con documentos largos o conversaciones extensas.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad frente al Qwen3-4B original ni frente a otras cuantizaciones.
- Licencia Apache-2.0: permite uso comercial, pero la ausencia de alineación puede incumplir políticas de plataformas o normativas sectoriales; conviene revisar el contexto legal de cada despliegue.
- Modelo de nicho: 108 descargas y 0 likes en el momento de la ficha; no hay comunidad ni soporte detrás, lo que reduce la fiabilidad a largo plazo.
- Verificar integridad: el autor publica checksums SHA-256 para los tres ficheros; deben comprobarse antes de desplegar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/truthcoder/TC-Mini-4B-GGUF
- Modelo base: https://huggingface.co/mlabonne/Qwen3-4B-abliterated
- Colección de todos los tamaños: https://huggingface.co/truthcoder/TC-Mini
- Demo en navegador: https://truthprotectors.github.io/TC-Mini/app/
- Código: https://github.com/truthprotectors/TC-Mini
