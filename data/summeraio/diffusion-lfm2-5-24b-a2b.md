# summerAIO/diffusion-lfm2.5-24b-a2b

## Resumen

Diffusion LFM2.5-24B-A2B es un checkpoint experimental publicado por el usuario summerAIO en Hugging Face, consistente en un ajuste fino con difusión de máscaras por bloques (block masked-diffusion) sobre el modelo `LiquidAI/LFM2.5-24B-A2B`. No se trata de un lanzamiento oficial de Liquid AI: el autor lo describe explícitamente como un artefacto de investigación y evaluación, con advertencias severas sobre su calidad. El modelo conserva la arquitectura MoE del modelo base (23.971.587.712 parámetros totales según safetensors) y añade una cabeza de decodificación por difusión que sustituye la generación autorregresiva por un muestreador de bloques.

El interés técnico del checkpoint es acotado y muy específico: explorar la viabilidad de la decodificación por difusión sobre un MoE de 24B y medir latencias en un A100 80GB. El autor reporta cifras de hasta 639 tokens/s en configuraciones concretas, pero insiste en que esas cifras son experimentos de latencia y no recomendaciones de calidad. La pantalla de repetición de texto falla de forma grave, y no se encontró ningún ajuste de pasos de denoising (1–15) que superase simultáneamente las pruebas de aritmética, respuesta corta exacta y repetición.

Por tanto, la ficha debe leerse como documentación de un experimento fallido o parcialmente fallido en calidad, útil para investigadores interesados en difusión sobre LLMs y en las dificultades de convertir un modelo autorregresivo en un decodificador de difusión. No es un modelo para producción ni para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (lfm2_moe) con decodificación por difusión de máscaras por bloques |
| Parametros totales | 23.971.587.712 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ja |
| Licencia | other (LFM Open License v1.0, con umbral comercial de 10M USD de ingresos anuales) |
| Formato de pesos | safetensors (BF16, ~48 GB) |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM2.5-24B-A2B` (revisión `3dc4cd09c9a2a99e1e819693e79d3aba5e9bb4f2`), un MoE de 24B parámetros totales con pesos de expertos empaquetados. Sobre esa base se aplicó un LoRA de rango 64 y alpha 128, entrenado para decodificación por difusión de máscaras por bloques y posteriormente fusionado en los pesos BF16 del modelo base. El checkpoint fusionado seleccionado corresponde a la actualización 3100, elegida mediante NLL de tokens enmascarados sobre validación fija.

Los datos de entrenamiento fueron ejemplos de Alpaca (CC-BY-NC-4.0) y ARC-Easy (split de entrenamiento), excluyendo registros de validación y test final. En 64 ejemplos de validación fijos, la NLL de media máscara pasó de 3.0261 a 2.7118 (reducción del 10,39 %) y la de máscara completa de 5.8993 a 5.6291 (4,58 %). En el test final de 256 ejemplos, la NLL de media máscara pasó de 3.0005 a 2.7312 (8,97 %) y la de máscara completa de 5.8205 a 5.6774 (2,46 %). El objetivo acordado del 10 % en ambos niveles de corrupción no se alcanzó. Estas pérdidas son entropía cruzada de denoising, no perplejidad autorregresiva ni una medida de corrección en generación libre.

La innovación técnica principal es el muestreador de bloques con un modo de atención distinto del causal ordinario. El autor advierte que `AutoModelForCausalLM.generate()` no invoca el muestreador de difusión; es necesario usar `modeling_diffusion_lfm.py` y `inference_recipe.json`. Además, la comparación estricta de logits enmascarados contra el adaptador sin fusionar falló (diferencia absoluta máxima de 8,44, con desajuste en top-1), por lo que el export fusionado debe tratarse como un artefacto experimental distinto y no como una conversión numéricamente equivalente.

## Capacidades

- Generación de texto mediante muestreo de difusión por bloques, no mediante decodificación autorregresiva estándar.
- Soporte de conversación con plantilla de chat (`apply_chat_template`) y prompts multi-turno.
- Idiomas declarados: inglés y japonés, aunque el autor reporta fragmentos mezclados de idiomas en las salidas.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito.
- No se documenta capacidad de código fiable; de hecho, el autor reporta Python malformado en las pruebas.

## Casos de uso

- Investigación sobre decodificación por difusión en LLMs: el checkpoint permite reproducir el muestreador de bloques y estudiar la degradación de calidad frente a la decodificación autorregresiva del modelo base, con la receta de inferencia incluida en el repositorio.
- Reproducción de medidas de latencia: sirve para replicar los 601,95 tokens/s (canvas 1024, 12 pasos) o los 639,16 tokens/s (canvas 512, 7 pasos) en un A100-SXM4-80GB, siempre como experimento de rendimiento y no de calidad.
- Estudio de fusión de adaptadores LoRA en MoE: el fallo de equivalencia numérica entre adaptador y checkpoint fusionado es un caso concreto para investigar errores de exportación en modelos con pesos de expertos empaquetados.
- Análisis de modos de fallo: la repetición severa, los bucles de tokens y los fragmentos multilingües documentados permiten estudiar degeneración en difusión de máscaras y diseñar pantallas de salud de texto.
- Evaluación comparativa de NLL de denoising: los valores de validación y test publicados permiten contrastar metodologías de evaluación de modelos de difusión frente a perplejidad autorregresiva.
- Docencia y divulgación: como ejemplo práctico de las diferencias entre muestreadores de difusión y `generate()` estándar en Transformers, y de los requisitos de memoria (BF16 ~48 GB) para un MoE de 24B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que ninguna evaluación amplia de lenguaje, código, multilingüismo o seguridad establece la calidad del modelo.

Los únicos datos numéricos publicados son de latencia y de pérdida de denoising:

| Metrica | Configuracion | Resultado |
|---|---|---|
| Tokens/s (mediana) | batch 1, input 256, canvas 1024, 12 pasos, max output 1024, A100-SXM4-80GB | 601,95 |
| Tokens/s (mediana) | batch 1, input 256, canvas 256, 4 pasos, max output 1024, A100-SXM4-80GB | 583,93 |
| Tokens/s (mediana) | batch 1, input 256, canvas 512, 7 pasos, max output 1024, A100-SXM4-80GB | 639,16 |
| NLL media mascara (validacion, 64 ejemplos) | antes → despues | 3,0261 → 2,7118 (-10,39 %) |
| NLL mascara completa (validacion, 64 ejemplos) | antes → despues | 5,8993 → 5,6291 (-4,58 %) |
| NLL media mascara (test, 256 ejemplos) | antes → despues | 3,0005 → 2,7312 (-8,97 %) |
| NLL mascara completa (test, 256 ejemplos) | antes → despues | 5,8205 → 5,6774 (-2,46 %) |

Las medidas de latencia se obtuvieron con 3 calentamientos y 5 repeticiones cronometradas. El autor subraya que la recomendación de 600 tokens/s es solo una configuración de experimento de latencia y no de calidad, y que las preguntas cortas producen longitudes de salida y tasas distintas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 fusionado ocupa aproximadamente 48 GB antes de overhead de runtime; se necesita una GPU con al menos 80 GB para cargar y ejecutar con comodidad.
- GPU recomendadas: A100-SXM4-80GB, que fue el objetivo medido de empaquetado e inferencia. H100 80GB sería un candidato natural por memoria, aunque no se documentan medidas en ella.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) no puede cargar los pesos BF16 de ~48 GB sin cuantización, y no se documentan recetas de cuantización para este checkpoint.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La inferencia requiere el código personalizado `modeling_diffusion_lfm.py` y el `inference_recipe.json` del repositorio, con `transformers` para el tokenizador.
- Latencia y throughput: hasta 639,16 tokens/s de salida en la configuración de canvas 512 y 7 pasos en A100 80GB; 601,95 tokens/s con canvas 1024 y 12 pasos. La latencia depende del prompt, la longitud de salida y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Tipo de decodificacion | Licencia | Calidad documentada |
|---|---|---|---|---|---|
| summerAIO/diffusion-lfm2.5-24b-a2b | 23.971.587.712 | no disponible | Difusion de mascaras por bloques | LFM Open License v1.0 (umbral comercial 10M USD) | Degeneracion severa; sin benchmarks de calidad |
| LiquidAI/LFM2.5-24B-A2B (base) | 24B (MoE) | no disponible | Autorregresiva | LFM Open License v1.0 | Modelo upstream de referencia; el autor recomienda usarlo para respuestas generales |
| Alternativas de difusion de texto de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base: el autor indica que, hasta que el checkpoint pase evaluaciones independientes más amplias, se prefiera la decodificación autorregresiva del modelo upstream para respuestas generales.

## Limitaciones y advertencias

- Calidad no apta para uso general: el autor declara que el modelo no es adecuado para uso fiable de propósito general, con repetición severa, fragmentos mezclados de idiomas, Python malformado y bucles de tokens.
- Sin benchmarks de calidad: no hay evaluación amplia de lenguaje, código, multilingüismo ni seguridad que establezca su rendimiento.
- Ningún ajuste de inferencia recomendado por calidad: el barrido de 1–15 pasos de denoising no encontró ninguna configuración que superase a la vez la prueba de media aritmética en código, la de respuesta corta exacta y la pantalla de repetición.
- Equivalencia numérica no verificada: la comparación estricta de logits enmascarados contra el adaptador sin fusionar falló (diferencia absoluta máxima 8,44, desajuste top-1); el export fusionado es un artefacto distinto.
- Dependencia de código personalizado: `generate()` estándar no usa el muestreador de difusión; se requiere `modeling_diffusion_lfm.py` e `inference_recipe.json`.
- Restricciones de licencia: la LFM Open License v1.0 permite redistribución de obras derivadas con atribución y copia de la licencia, pero el uso comercial por entidades con ingresos anuales iguales o superiores a 10 millones de USD no está licenciado por esta concesión.
- Licencia de datos de entrenamiento: Alpaca es CC-BY-NC-4.0, lo que impone términos adicionales sobre los datos usados en el ajuste.
- Sesgos: no documentados en la información disponible; la naturaleza experimental y la falta de evaluación impiden descartar sesgos del modelo base o introducidos por el ajuste.
- Riesgo de alucinación: elevado por la degeneración observada y la ausencia de evaluación de corrección en generación libre.
- Limitaciones de idioma: solo se declaran inglés y japonés, con evidencia de mezcla de idiomas en las salidas.
- Medidas de latencia limitadas a una única configuración de A100 80GB; no son extrapolables a otro hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia del modelo base (LFM Open License v1.0): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Dataset Alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
