# UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2.5e

## Resumen

Uraion Cyber V1.0 MLX oQ2.5e es una cuantización de 2,5 bits del modelo Uraion Cyber V1.0, desarrollada por Uraion Labs para su ejecución local en Apple Silicon mediante el runtime oMLX/MLX. El modelo original es un mixture-of-experts (MoE) de aproximadamente 35.000 millones de parámetros totales con unos 3.000 millones activos por token (35B-A3B), distribuidos en 256 expertos con 8 enrutados por token, y una ventana de contexto arquitectónica de 262.144 tokens. Está especializado en seguridad defensiva y trabajo agéntico: detección de vulnerabilidades, auditoría de código, generación de parches y reconocimiento de código correcto cuando no hay fallo.

Esta variante concreta aplica una cuantización de precisión mixta (oQ2.5e) con matrices de importancia mejoradas (imatrix), generada localmente con oMLX 0.7.4.dev1. El resultado ocupa 14,89 GB de pesos en safetensors MLX, lo que permite desplegar un modelo de 35B en equipos Apple Silicon con memoria unificada moderada, a costa de una pérdida de fidelidad respecto a los pesos BF16 del modelo padre.

La relevancia actual radica en la combinación de tres factores: un modelo de seguridad ofensiva/defensiva con capacidades de razonamiento y tool calling, un tamaño MoE que reduce el coste de inferencia por token (solo ~3B activos) y un formato cuantizado pensado para hardware de consumo. La licencia MIT facilita su uso comercial, aunque el modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 256 expertos, 8 enrutados por token |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B por token (35B-A3B) |
| Longitud de contexto | 262.144 tokens (límite arquitectónico) |
| Tipos de cuantizacion | oQ2.5e (precisión mixta, imatrix mejorada); la familia incluye oQ2, oQ3, oQ4e, oQ5e, oQ6e y oQ8e |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors MLX (formato nativo MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 256 expertos, de los que se enrutan 8 por token, lo que da un total de ~35,95B de parámetros con ~3B activos por token. La ventana de contexto arquitectónica es de 262.144 tokens. El checkpoint conserva el tokenizador y la plantilla de chat originales, así como la torre de visión (el pipeline es image-text-to-text) y los pesos MTP (multi-token prediction) si estaban presentes en el checkpoint fuente. Los detalles sobre la composición del dataset de entrenamiento, el número de tokens vistos y las fases de RLHF/DPO no están disponibles en la información proporcionada; la model card remite a la ficha del modelo padre BF16 para la metodología de evaluación completa.

La innovación principal de esta ficha es la cuantización: oMLX 0.7.4.dev1 aplica una cuantización oQ2.5e con matrices de importancia mejoradas (imatrix) y precisión mixta (los niveles fraccionarios no usan un ancho de bits uniforme). El proceso se documenta en los ficheros `quantization_info.json`, `oq_imatrix_report.json`, `smoke_test.json` y `SHA256SUMS` del repositorio. El modelo declara soporte de modo thinking (razonamiento extendido) que puede desactivarse mediante `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generación de texto y razonamiento con modo thinking activable o desactivable.
- Detección de vulnerabilidades y auditoría de código con prueba de explotabilidad en sandbox.
- Generación de parches para fallos identificados.
- Reconocimiento de código correcto: el modelo está entrenado para declarar que un fragmento es seguro cuando no hay fallo, capacidad medida en el modelo padre.
- Tool calling y function calling (evaluado con BFCL en el modelo padre).
- Trabajo agéntico multi-paso (episodios agénticos evaluados en el modelo padre).
- Generación de código (evaluado con HumanEval+ en el modelo padre).
- Capacidades de visión: el pipeline es image-text-to-text y la torre de visión se conserva en la cuantización.
- Seguimiento de instrucciones (evaluado con IFEval en el modelo padre).
- Multilingüe: solo inglés declarado.

## Casos de uso

- Auditoría de seguridad de servicios en producción: el modelo recibe el código de un servicio y devuelve el nombre de la función vulnerable junto con la petición concreta que demuestra el fallo, o confirma que el código es correcto. El contexto de 262.144 tokens permite introducir módulos completos sin trocear.
- Revisión de pull requests en CI/CD: integrado como paso de análisis, puede señalar vulnerabilidades explotables y proponer parches, con tool calling para consultar el repositorio o ejecutar pruebas en un sandbox.
- Generación de parches de seguridad: dado un fallo identificado, el modelo produce el cambio de código correspondiente; su entrenamiento específico en patch generation lo hace adecuado para este flujo frente a modelos generalistas.
- Agentes de respuesta a incidentes: con soporte agéntico multi-paso y function calling, puede encadenar consultas a herramientas (logs, escáneres, repositorios) para reconstruir un incidente y proponer mitigaciones.
- Triaje de falsos positivos: la capacidad de declarar código correcto como correcto (75,4 % en el modelo padre, frente al 45,1 % de Qwen3.6-35B-A3B) reduce el ruido en pipelines de SAST que generan alertas masivas.
- Despliegue local en Apple Silicon para equipos de seguridad: con 14,89 GB de pesos y ~3B activos por token, puede ejecutarse en un Mac con memoria unificada suficiente sin enviar código propietario a servicios externos, algo crítico en auditorías bajo confidencialidad.
- Asistente de formación en AppSec: conversaciones multi-turno con contexto largo para explicar vulnerabilidades, reproducirlas y discutir la corrección.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo padre BF16 servido con vLLM 0.33.0 (cuantización FP8 de pesos en carga) y **no fueron medidos sobre esta build MLX**; las cuantizaciones de 2 y 3 bits intercambian calidad por menor huella de memoria.

| Prueba (modelo padre en vLLM) | Uraion Cyber V1.0 | Qwen3.6-35B-A3B | Uraion Cyber preview |
|---|---:|---:|---:|
| Tareas de seguridad held-out, respuesta única (758) | 681 (89,8 %) | 603 (79,6 %) | 610 (80,5 %) |
| Tareas de seguridad de confirmación fresh (387) | 352 (91,0 %) | 309 (79,8 %) | — |
| Episodios agénticos held-out (200) | 190 (95,0 %) | 175 (87,5 %) | 164 (83,2 %) |
| Episodios agénticos fresh (200) | 191 (95,5 %) | 172 (86,0 %) | — |
| Código correcto reportado como correcto (122) | 92 (75,4 %) | 55 (45,1 %) | 59 (48,4 %) |
| IFEval prompt · strict (541) | 425 (78,6 %) | 390 (72,1 %) | 441 (81,5 %) |
| BFCL (400) | 368 (92,0 %) | 364 (91,0 %) | 358 (89,5 %) |
| HumanEval+ (164) | 149 (90,9 %) | 148 (90,2 %) | 148 (90,2 %) |
| Peticiones dañinas rechazadas (30) | 30 | 30 | 30 |

No se han publicado resultados de benchmarks medidos sobre esta build oQ2.5e MLX en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 14,89 GB solo de pesos; hay que sumar memoria para runtime, activaciones y caché KV. El contexto máximo utilizable depende de la memoria disponible y de la configuración del runtime; los 262.144 tokens son el límite arquitectónico, no una garantía de memoria.
- Hardware objetivo: Apple Silicon con Metal (el runtime es oMLX/MLX). No aplica a GPU NVIDIA de forma nativa.
- GPU de consumo: cabe en equipos Apple Silicon con memoria unificada suficiente para pesos más runtime, activaciones y KV; el fabricante no especifica un mínimo exacto.
- Despliegue: `omlx serve` sobre el directorio descargado, o un runtime mlx-vlm compatible con soporte de Qwen3.5 MoE. La API es compatible con OpenAI (`/v1`), lo que permite usar el cliente de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Uraion Cyber V1.0 MLX oQ2.5e | ~35,95B totales, ~3B activos | 262.144 | Seguridad defensiva, auditoría, parches | MIT | Safetensors MLX |
| Uraion Cyber V1.0 (BF16) | ~35,95B totales, ~3B activos | 262.144 | Seguridad defensiva, auditoría, parches | MIT | Safetensors (BF16) |
| Qwen3.6-35B-A3B | 35B-A3B (según benchmarks citados) | no disponible | Generalista | no disponible | no disponible |
| Uraion Cyber preview | no disponible | no disponible | Seguridad defensiva (versión previa) | no disponible | no disponible |

En las pruebas del modelo padre, Uraion Cyber V1.0 supera a Qwen3.6-35B-A3B en tareas de seguridad held-out (89,8 % frente a 79,6 %), episodios agénticos (95,0 % frente a 87,5 %) y reconocimiento de código correcto (75,4 % frente a 45,1 %), con resultados cercanos en BFCL y HumanEval+.

## Limitaciones y advertencias

- La cuantización oQ2.5e degrada la calidad respecto a los pesos BF16; los benchmarks publicados corresponden al modelo padre y no a esta build.
- El modelo solo declara inglés; no hay soporte multilingüe verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en seguridad: una vulnerabilidad inventada o un falso negativo puede tener consecuencias graves. Las conclusiones deben validarse en sandbox.
- Sesgos conocidos: no documentados en la información disponible.
- El contexto de 262.144 tokens es un límite arquitectónico; el contexto realmente usable depende de la memoria disponible en Apple Silicon.
- La licencia MIT permite uso comercial, pero el modelo está orientado a seguridad defensiva; el uso ofensivo no está avalado por la documentación y puede contravenir las políticas del proveedor.
- Requiere runtime oMLX actualizado o mlx-vlm con soporte de Qwen3.5 MoE; otros runtimes (vLLM, llama.cpp, Ollama, TGI) no se mencionan como compatibles con este formato MLX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2.5e
- Modelo padre BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2.5e/blob/main/LICENSE
- Sitio de Uraion Labs: https://uraionlabs.com/
- Informe de cuantización imatrix: `oq_imatrix_report.json` (en el repositorio)
- Información de cuantización: `quantization_info.json` (en el repositorio)
- Prueba de humo: `smoke_test.json` (en el repositorio)
- Sumas de verificación: `SHA256SUMS` (en el repositorio)
