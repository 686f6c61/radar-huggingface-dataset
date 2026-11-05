# TigreGotico/m2m100_418M_en_lug_rel_news_ft-onnx

## Resumen

El modelo `m2m100_418M_en_lug_rel_news_ft-onnx` es una exportación a formato ONNX del modelo `masakhane/m2m100_418M_en_lug_rel_news_ft`, un ajuste fino de `facebook/m2m100_418M` especializado en traducción automática de inglés (en) a luganda (lg). Lo publica el usuario TigreGotico en HuggingFace y su único aporte técnico es la conversión de los pesos originales a ONNX (fp32 e int8 dinámico), sin reentrenamiento ni modificación de los pesos. El modelo original fue desarrollado por Masakhane dentro del proyecto MAFAND-MT (Adelani et al., NAACL 2022), orientado a lenguas africanas de bajos recursos.

La relevancia de esta ficha es doble. Por un lado, cubre un par de idiomas (inglés-luganda) con escasa representación en herramientas de traducción comerciales, y lo hace con una licencia permisiva (AFL-3.0) que permite uso comercial. Por otro, la exportación ONNX facilita el despliegue en entornos sin PyTorch, con un binario int8 de 3,0 GB frente a los 4,6 GB en fp32, a costa de una pérdida de paridad medible (50-60 % de coincidencia exacta frente al original).

Arquitectónicamente es un transformer encoder-decoder de tipo M2M100 con 418 millones de parámetros, entrenado originalmente por Facebook sobre 100 idiomas y ajustado después sobre JW300 más el corpus de noticias MAFAND. El contexto es el estándar de M2M100 (1024 tokens). El repositorio ocupa 7,9 GB y acumula 6 descargas en el momento de la consulta, lo que refleja un uso muy incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M100) |
| Parametros totales | 418 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (estándar de M2M100) |
| Tipos de cuantizacion | fp32 (4,6 GB) e int8 dinámico (3,0 GB) |
| Idiomas soportados | en (inglés) y lg (luganda); dirección en→lg |
| Licencia | AFL-3.0 |
| Formato de pesos | ONNX (raíz en fp32, subcarpeta `int8/`) |

## Arquitectura y entrenamiento

El modelo subyacente es `facebook/m2m100_418M`, un transformer encoder-decoder multilingüe con 418 millones de parámetros y tokenizador SentencePiece con tokens de idioma explícitos. Masakhane lo ajustó sobre JW300 y el corpus de noticias MAFAND para la dirección inglés→luganda, dentro del trabajo "A Few Thousand Translations Go a Long Way!" (Adelani et al., NAACL 2022). No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el modelo card original no los documenta en esta exportación.

La innovación técnica de esta ficha concreta es únicamente el pipeline de exportación: `optimum-cli export onnx --task text2text-generation-with-past --no-post-process`. Se generan dos variantes, fp32 y int8 dinámico, y se documenta una comprobación de paridad contra `AutoModelForSeq2SeqLM.generate()`. Un detalle crítico del ajuste fino es que el modelo emite luganda tras el token `__sw__` (id 128088) y no tras `__lg__`, porque tanto el `config.json` original como el `generation_config.json` de este repositorio fuerzan `forced_bos_token_id` a `__sw__`. Sobrescribir ese valor con `__lg__` rompería la generación.

## Capacidades

- Traducción automática unidireccional inglés→luganda, con salida en texto natural.
- Generación seq2seq con decodificación greedy o beam search (el model card valida beam=4).
- Ejecución sin PyTorch mediante ONNX Runtime y la clase `ORTModelForSeq2SeqLM` de Optimum.
- Soporte de caché de atención (`use_cache=True`), lo que reduce el coste de decodificación en secuencias largas.
- No soporta tool calling, function calling ni razonamiento multi-step.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al par en→lg en la práctica; el modelo base M2M100 cubre 100 idiomas, pero este ajuste fino está especializado y no se garantiza calidad fuera del par.
- No es un modelo de agentes ni de instrucciones generales.

## Casos de uso

- Traducción de noticias y comunicados: el ajuste fino se entrenó sobre el corpus de noticias MAFAND, por lo que el registro periodístico inglés→luganda es su dominio natural. Se usaría con beam=4 y fp32 para maximizar fidelidad.
- Localización de documentación técnica o institucional para comunidades lugandófonas: el modelo permite traducir guías, avisos sanitarios o materiales educativos sin depender de APIs comerciales que no cubren bien el luganda.
- Despliegue en entornos sin PyTorch: gracias a la exportación ONNX, puede integrarse en servicios escritos en C#, Java o C++ mediante ONNX Runtime, algo habitual en infraestructura empresarial.
- Inferencia en CPU con la variante int8: los 3,0 GB del binario cuantizado permiten servir traducciones en servidores sin GPU, aceptando la pérdida de paridad documentada (50-60 % de coincidencia exacta con el original).
- Procesamiento por lotes de corpus paralelos: útil para investigadores que necesitan generar traducciones de referencia o ampliar corpus en→lg para experimentos de NLP de bajos recursos.
- Integración en pipelines de subtitulado o transcripción: combinado con un ASR en inglés, el modelo puede traducir transcripciones al luganda en un flujo por etapas, aunque el contexto de 1024 tokens limita la longitud de los segmentos.
- Investigación en traducción de bajos recursos: sirve como línea base reproducible (pesos ONNX, licencia AFL-3.0) para comparar con modelos más grandes o con evaluaciones FLORES-200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (FLORES-200, chrF, BLEU) en la información disponible. El único dato de rendimiento es la comprobación de paridad del exportador contra el modelo PyTorch original, sobre 10 frases generales en inglés y con coincidencia exacta de cadena:

| Decodificación | fp32 (n=10) | int8 (n=10) |
|---|---|---|
| Greedy | 100 % (10/10) | 50 % (5/10) |
| Beam=4 | 100 % (10/10) | 60 % (6/10) |

El propio autor advierte que n=10 es una estimación pequeña y ruidosa, no una evaluación a escala FLORES, y que en su proyecto se han observado variaciones de 100 % a 14 % al remedir con n=100. Las discrepancias del int8 se inspeccionaron manualmente y corresponden a variación de paráfrasis en luganda (orden de palabras, sinónimos), no a texto corrupto ni a salida en otro idioma.

## Requisitos de hardware

- VRAM estimada para fp32: en torno a 5-6 GB considerando pesos (4,6 GB) más activaciones y caché; cabe en GPUs consumer de 8 GB o más.
- VRAM estimada para int8: en torno a 3,5-4 GB; cabe en GPUs de 4-6 GB y en muchas integradas con suficiente memoria compartida.
- GPU recomendadas: RTX 3060/4060 (8 GB) o superiores para fp32; RTX 3050 (4 GB) o incluso CPU para int8. Para servir en producción con concurrencia, A10G o L4 son opciones razonables por relación coste/rendimiento.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: ONNX Runtime (vía Optimum), servidores de inferencia compatibles con ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a modelos encoder-decoder ONNX de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| m2m100_418M_en_lug_rel_news_ft-onnx (este) | 418 M | 1024 | en→lg | AFL-3.0 | ONNX fp32/int8 |
| masakhane/m2m100_418M_en_lug_rel_news_ft | 418 M | 1024 | en→lg | AFL-3.0 | safetensors/PyTorch |
| facebook/m2m100_418M | 418 M | 1024 | 100 idiomas | MIT | safetensors/PyTorch |
| facebook/nllb-200-distilled-600M | 600 M | 1024 | 200 idiomas | CC-BY-NC-4.0 | safetensors/PyTorch |

Frente al modelo original de Masakhane, esta exportación no mejora la calidad: la reproduce en fp32 y la degrada en int8. Su ventaja es operativa (ONNX, sin PyTorch). Frente a `facebook/m2m100_418M`, el ajuste fino debería superar en calidad al modelo base para en→lg, aunque no hay métricas publicadas que lo cuantifiquen. Frente a NLLB-200 distilled, este último cubre más idiomas pero su licencia CC-BY-NC-4.0 prohíbe el uso comercial, mientras que AFL-3.0 sí lo permite.

## Limitaciones y advertencias

- Dirección única: solo traduce en→lg; no se ha validado lg→en ni otros pares.
- El token de idioma de destino es `__sw__` (suajili) por herencia del ajuste fino; usar `__lg__` produce salidas incorrectas.
- La cuantización int8 degrada la paridad de forma notable (50-60 % de coincidencia exacta frente a fp32), aunque el autor la describe como variación de paráfrasis.
- La evaluación de paridad se basa en n=10 frases; no hay evaluación FLORES-200 ni chrF publicada, por lo que la calidad real en producción es incierta.
- Riesgo de alucinación y de omisión de contenido en textos largos o dominios distintos al periodístico (el corpus de entrenamiento es JW300 más noticias MAFAND).
- Contexto de 1024 tokens: no apto para documentos largos sin segmentación previa.
- Sesgos: al entrenarse sobre JW300 (texto religioso) y noticias, puede reflejar sesgos de dominio y de registro; no hay análisis de sesgo publicado.
- Licencia AFL-3.0: permite uso comercial, pero obliga a incluir el texto de la licencia y a preservar la atribución a Masakhane y a los autores originales; conviene revisar las cláusulas de patentes y de redistribución.
- El repositorio tiene 6 descargas y 0 likes: no hay evidencia de uso en producción ni de validación comunitaria.
- No sustituye a una evaluación humana en contextos sensibles (sanitario, legal, administrativo).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TigreGotico/m2m100_418M_en_lug_rel_news_ft-onnx
- Modelo base original: https://huggingface.co/masakhane/m2m100_418M_en_lug_rel_news_ft
- Modelo M2M100 de Facebook: https://huggingface.co/facebook/m2m100_418M
- Proyecto MAFAND-MT (código): https://github.com/masakhane-io/lafand-mt
- Masakhane: https://www.masakhane.io/
- Paper de referencia (Adelani et al., NAACL 2022, "A Few Thousand Translations Go a Long Way!"): no disponible en los resultados de búsqueda proporcionados
- Optimum (exportación ONNX): no disponible en los resultados de búsqueda proporcionados
