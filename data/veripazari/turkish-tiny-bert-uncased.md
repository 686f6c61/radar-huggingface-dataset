# veripazari/turkish-tiny-bert-uncased

## Resumen

`turkish-tiny-bert-uncased` es un modelo de lenguaje enmascarado (fill-mask) de tipo BERT en su variante Tiny, desarrollado originalmente por el equipo `ytu-ce-cosmos` (Universidad Tecnica de Yildiz, Turquia) y reempaquetado en el repositorio `veripazari/turkish-tiny-bert-uncased` por la plataforma VeriPazari como archivo para el ecosistema de IA en turco. Su proposito es cubrir el hueco de modelos BERT turcos de muy bajo coste computacional, con solo 4,6 millones de parametros, lo que permite ejecutarlo en CPU y en dispositivos con recursos muy limitados.

Se trata de un modelo encoder-only con atencion bidireccional, disenado exclusivamente para tareas de enmascaramiento de tokens y, por extension, para generar representaciones contextuales utiles en clasificacion, NER o similitud semantica tras un ajuste fino. No es un modelo generativo ni conversacional: no produce texto libre de forma autoregresiva, sino que predice el token `[MASK]` en funcion del contexto bilateral.

Su relevancia actual es acotada pero clara: sirve como linea base ligera para experimentos en turco, para entornos de produccion con latencia y memoria minimas, y como ejemplo de modelo Tiny BERT multilingue adaptado a un idioma morfologicamente complejo como el turco. La licencia MIT y el formato safetensors facilitan su integracion comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only, transformer bidireccional) en variante Tiny |
| Parametros totales | 4.624.130 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tipico de BERT: 512 tokens, sin confirmar en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch, TensorFlow (tf) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT estandar en su configuracion Tiny: un transformer encoder con atencion multi-cabeza bidireccional, pensado para producir representaciones contextuales de cada token. Con 4,6 millones de parametros, se situa muy por debajo de BERT-base (110M) y de DistilBERT (66M), lo que reduce drasticamente los requisitos de memoria y computo a costa de capacidad representacional.

Segun la model card, el entrenamiento se realizo principalmente sobre datos rastreados (crawled) en turco, lo que implica que el corpus puede contener sesgos inherentes a la web. El modelo es uncased (no distingue mayusculas de minusculas), y el autor advierte de un problema conocido del tokenizador de Hugging Face que obliga a realizar una conversion manual a minusculas con `text.replace("I", "ı").lower()` en lugar de confiar en `do_lower_case = True`. El articulo asociado (arXiv:2307.14134) describe el desarrollo y evaluacion de modelos BERT turcos de tamano Tiny a Medium. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables, en principio, a un modelo encoder-only de fill-mask).

## Capacidades

- Prediccion de tokens enmascarados (fill-mask) en turco, como se muestra en el ejemplo de la model card: `"gelirken bir litre [MASK] aldım."` predice `su` con probabilidad 0,20.
- Generacion de representaciones contextuales bidireccionales utiles para ajuste fino en clasificacion de texto, analisis de sentimiento, NER y similitud semantica.
- Manejo de texto en turco sin distincion de mayusculas (uncased), previa conversion manual a minusculas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada: solo turco.
- No es un modelo generativo autoregresivo; no produce texto libre.

## Casos de uso

- Linea base para experimentos de NLP en turco: util para validar pipelines de entrenamiento y evaluacion antes de escalar a modelos mayores como BERT-base turco o XLM-R, gracias a su bajo coste de entrenamiento y ejecucion.
- Clasificacion de textos cortos en produccion con recursos minimos: tras ajuste fino, puede desplegarse en CPU para etiquetar resenas, tickets o comentarios en turco con latencia muy baja.
- Relleno de huecos en plantillas y formularios: el pipeline fill-mask permite sugerir la palabra probable en contextos controlados, util en asistentes de redaccion o correccion ortografica basica.
- Extraccion de entidades nombradas (NER) en turco: con un cabezal de clasificacion token a token, sirve para detectar nombres, lugares y organizaciones en textos rastreados.
- Deteccion de similitud semantica y deduplicacion: las representaciones del encoder permiten comparar frases cortas en turco para agrupar documentos o detectar duplicados.
- Prototipado educativo y de investigacion: por su tamano (0,1 GB de repo) y licencia MIT, es adecuado para docencia, pruebas de concepto y entornos con GPU consumer o incluso sin GPU.
- Filtrado previo en pipelines de datos: puede usarse como clasificador rapido para descartar o etiquetar grandes volumenes de texto turco antes de pasarlos a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de fill-mask o GLUE turco. El articulo arXiv:2307.14134 podria contener evaluaciones, pero no se han proporcionado en la informacion recibida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (4,6M de parametros, aproximadamente 18 MB de pesos); en la practica cabe en cualquier GPU y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090) es mas que suficiente.
- Cabe en cualquier GPU consumer y en dispositivos de borde (Raspberry Pi, moviles) con cuantizacion o incluso sin ella.
- Opciones de despliegue: transformers (PyTorch/TensorFlow), pipeline de Hugging Face, ONNX Runtime, llama.cpp no aplica (no es modelo GGUF), vLLM y TGI no estan orientados a este tipo de modelo pero podrian servir para serving de encoders.
- Latencia y throughput estimados: no disponibles en la informacion; por el tamano, se espera latencia de milisegundos en CPU y throughput muy alto en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veripazari/turkish-tiny-bert-uncased | 4,6M | no disponible | turco | MIT | Hugging Face |
| ytu-ce-cosmos/turkish-tiny-bert-uncased (original) | 4,6M | no disponible | turco | MIT | Hugging Face |
| BERT-base turco (p. ej. dbmdz/bert-base-turkish-cased) | ~110M | 512 | turco | MIT | Hugging Face |
| DistilBERT multilingue | ~66M | 512 | multilingue | Apache 2.0 | Hugging Face |

La comparativa se limita a parametros, contexto, idioma y licencia; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena principalmente sobre datos rastreados de la web, lo que puede introducir sesgos sociales, culturales y de representacion; el autor lo advierte explicitamente.
- Riesgo de alucinacion: bajo en sentido estricto (no genera texto libre), pero puede producir predicciones de fill-mask incorrectas o estereotipadas con alta confianza.
- Limitaciones de contexto e idioma: solo turco; la longitud de contexto no se confirma en la informacion, aunque en BERT tipico es 512 tokens.
- Restricciones de licencia: MIT permite uso comercial sin restricciones, pero se recomienda citar el trabajo original y conservar los avisos de licencia.
- Caveat de produccion: el tokenizador requiere conversion manual a minusculas (`text.replace("I", "ı").lower()`); usar `do_lower_case = True` provoca resultados incorrectos por un problema conocido de transformers.
- Capacidad limitada: con 4,6M de parametros, su rendimiento en tareas complejas sera inferior al de modelos mayores; no debe usarse como sustituto de un LLM para generacion o razonamiento.
- El repositorio es un reempaquetado de terceros (VeriPazari); conviene verificar la integridad de los pesos frente al original `ytu-ce-cosmos/turkish-tiny-bert-uncased`.

## Enlaces

- Hugging Face (repositorio actual): https://huggingface.co/veripazari/turkish-tiny-bert-uncased
- Modelo original: https://huggingface.co/ytu-ce-cosmos/turkish-tiny-bert-uncased
- Articulo: https://arxiv.org/abs/2307.14134
- Plataforma del reempaquetado: https://veripazari.com.tr
- Issue del tokenizador de transformers: https://github.com/huggingface/transformers/issues/6680
- TensorFlow Research Cloud: https://sites.research.google/trc/about/
