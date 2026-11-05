# SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP

## Resumen

Kitchoon-V5.1-Clean-26B-A4B-EXP es un ajuste fino de tipo LoRA bakeado sobre el modelo base Tetratype/Gemma-4-26B-A4B-it-heretic-antislop, desarrollado por el usuario SubMaroon. Se trata de un modelo de arquitectura Mixture of Experts (MoE) derivado de la familia Gemma 4, con 25.805.933.872 parámetros totales y un tamaño de repositorio de 51,6 GB. Su propósito es la generación de texto orientada a roleplay (RP) y contenido para adultos (ERP), con un estilo de escritura neutro y énfasis en el desarrollo de personajes.

La versión V5.1 es una re-cocción (rebake) de Kitchoon-V5-Clean con una intensidad de LoRA reducida: la atención OV se bakea a 0,7 en lugar de 1,0. Según el autor, esto conserva gran parte del estilo entrenado pero devuelve parte de la lógica del modelo base, corrigiendo la tendencia de V5-Clean a perder el hilo argumental en escenas largas. El modelo se entrena desde cero sobre el mismo dataset que V3, con una plantilla de entrenamiento corregida que respeta el canal de pensamiento vacío que Gemma 4 espera antes de cada respuesta.

Es relevante ahora porque aborda dos problemas técnicos concretos del ajuste fino de modelos conversacionales: la degradación del razonamiento por plantillas de entrenamiento incorrectas y el colapso de la distribución de salida mediante el uso de una función de pérdida GEM en lugar de entropía cruzada estándar. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) derivada de Gemma 4 |
| Parámetros totales | 25.805.933.872 |
| Parámetros activos | no disponible (etiqueta A4B sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantización | no disponible (existe GGUF según la model card, sin listar variantes) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF mencionado en la model card |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer con mezcla de expertos (MoE), heredada de Gemma 4 en su variante 26B-A4B. El ajuste fino se realizó mediante LoRA sobre dos componentes específicos: la atención OV (`v_proj` + `o_proj`) en las capas 10–29 con 36 objetivos y rango/alpha de 32/64, bakeada a 0,7; y el MLP denso (`gate_proj` + `up_proj` + `down_proj`) en las capas 10–20 con 33 objetivos y rango/alpha de 16/32, bakeado a 0,5. Los expertos MoE, el router, `lm_head`, QK, embeddings y la torre de visión permanecen idénticos al base, verificado por nombre de módulo y forma de matriz; en pruebas, aproximadamente el 94% de las elecciones de experto coinciden con el modelo base.

El entrenamiento usó una única época (756 pasos) con tasa de aprendizaje 2,5e-5 y decaimiento coseno, contexto de 8192 tokens y pérdida GEM (Li et al., ICLR 2025) con β = 0,7 en lugar de entropía cruzada estándar. La pérdida de evaluación bajó de 2,53 a 1,47. Se enmascararon de la pérdida frases cliché, construcciones tipo "no solo X sino Y", finales de pregunta binaria, ecos del usuario, ecos de la tarjeta de personaje y repeticiones de respuestas anteriores del propio modelo. El dataset, cedido por Indexnusrefather, consta de conversaciones multi-turno en inglés construidas sobre tarjetas de personaje, divididas en ventanas de 8192 tokens (unas 3000 ventanas), con limpieza previa de personajes menores de edad y personas reales.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay y ERP.
- Desarrollo de personajes con estilo de escritura neutro.
- Canal de pensamiento (thinking) funcional: según el autor, se abre y cierra en todas las ejecuciones de prueba sin presupuesto de razonamiento explícito.
- Razonamiento básico preservado del modelo base (la reducción de intensidad OV busca recuperar lógica de escena).
- Capacidades multilingües limitadas al inglés declarado.
- Soporte de tool calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades de visión: la torre de visión permanece stock según la model card, pero no se documenta su uso.

## Casos de uso

- Roleplay conversacional en producción: el modelo mantiene coherencia de personaje en escenas largas gracias a la reducción de la intensidad OV a 0,7, que mitiga la pérdida de hilos argumentales reportada en V5-Clean. Adecuado para plataformas de ficción interactiva.
- Integración en frontends tipo SillyTavern: la etiqueta `sillytavern` y el formato de entrenamiento sobre tarjetas de personaje lo hacen directamente compatible con pipelines de rol que consumen tarjetas y system prompts.
- Generación de ficción narrativa asistida: el enmascaramiento de clichés y construcciones repetitivas en la pérdida reduce la aparición de frases slop ("a flicker of", "voice dropping to a"), útil para escritura asistida de diálogo.
- Investigación sobre ajuste fino con pérdida GEM: el modelo documenta explícitamente el uso de GEM β = 0,7 con gradiente equivalente a entropía cruzada a temperatura 0,7, lo que lo convierte en un caso de estudio reproducible para experimentos de diversidad de salida.
- Evaluación de técnicas de bakeado de LoRA: la separación de intensidades entre OV (0,7) y MLP denso (0,5), junto con el redondeo estocástico en bf16, sirve como referencia para estudiar cómo la intensidad de bakeado afecta a la lógica frente al estilo.
- Despliegue local con cuantización GGUF: la model card indica que el GGUF fue verificado contra safetensors con tokens idénticos y perplejidad coincidente, lo que permite servir el modelo en hardware de consumo mediante llama.cpp u Ollama.
- Base para experimentos de desbloqueo (uncensored): al ser un derivado heretic/antislop con licencia Apache 2.0, puede usarse como punto de partida para investigación sobre alineación y filtrado de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de evaluación (entropía cruzada) que bajó de 2,53 a 1,47 durante el entrenamiento, y la coincidencia de elección de experto (~94%) respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 25,8B parámetros totales, en bf16 requeriría aproximadamente 51,6 GB de pesos, coherente con el tamaño del repo; en cuantización de 4 bits se situaría en torno a 13–15 GB, aunque estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible en la información. Por tamaño, un modelo de ~26B en bf16 requiere GPUs de 80 GB (A100, H100) o múltiples GPUs; en cuantización 4-bit podría caber en una RTX 4090 (24 GB).
- ¿Cabe en consumer GPU? Probablemente en cuantización 4-bit en GPUs de 16–24 GB, pero no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners GGUF (existe GGUF verificado); vLLM y TGI no confirmados para esta arquitectura.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Kitchoon-V5.1-Clean-26B-A4B-EXP | 25,8B (MoE) | 8192 (entrenamiento) | Apache 2.0 | RP/ERP, inglés |
| Tetratype/Gemma-4-26B-A4B-it-heretic-antislop (base) | ~26B (MoE) | no disponible | no disponible | Base heretic/antislop |
| Kitchoon-V5-Clean (versión previa) | 25,8B (MoE) | 8192 | Apache 2.0 | RP/ERP, OV a 1,0 |
| Kitchoon-V3 | no disponible | 8192 | no disponible | RP/ERP, OV a 0,5 |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en roleplay y contenido para adultos (ERP); no está optimizado para tareas generales de razonamiento, código o matemáticas.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- Riesgo de alucinación inherente a modelos generativos conversacionales, no cuantificado por el autor.
- Contenido sin censura (uncensored/heretic): puede generar material sensible; requiere moderación en producción.
- La ventana de contexto documentada es de 8192 tokens (la de entrenamiento); no se confirma contexto nativo superior.
- El ajuste fino solo modifica atención OV y MLP denso; los expertos MoE y el router son los del base, por lo que los sesgos del modelo original persisten.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base declara una licencia distinta ("no disponible" en la información); conviene verificar la compatibilidad de la cadena de licencias.
- Modelo experimental (sufijo EXP) con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP
- Modelo base: https://huggingface.co/Tetratype/Gemma-4-26B-A4B-it-heretic-antislop
- Paper GEM loss (Li et al., ICLR 2025): https://arxiv.org/abs/2408.16673
- Donaciones del autor (Boosty): https://boosty.to/submaroon/donate
- Perfil del proveedor del dataset: https://huggingface.co/Indexnusrefather
