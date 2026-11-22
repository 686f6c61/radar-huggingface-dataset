# yicheng768617/qwen3.8-flash-next-jlens

## Resumen

`yicheng768617/qwen3.8-flash-next-jlens` no es un modelo de lenguaje, sino un artefacto de interpretabilidad: un Jacobian Lens ajustado sobre el modelo `Qwen/Qwen3.8-Flash-Next-FP8`. El autor, Yicheng Xia, aplica el método descrito por Gurnee et al. (2026) en "Verbalizable Representations Form a Global Workspace in Language Models" para construir, capa a capa, el jacobiano medio de la corriente residual final respecto a la corriente residual de cada bloque. El resultado permite proyectar estados residuales intermedios al espacio de vocabulario y observar qué está "preparando" cada capa mucho antes de que el logit lens produzca tokens legibles.

El artefacto cubre los 48 bloques decodificadores más el embedding de tokens (49 mapas en total) y se ajustó sobre 1.000 prompts de WikiText-103. Su interés es doble: por un lado sirve como herramienta de análisis mecanicista para estudiar cómo Qwen3.8-Flash-Next representa conceptos intermedios; por otro, documenta una arquitectura poco habitual, el residual gated de 4 flujos (`hc_count=4`), para el que el autor publica tanto la versión colapsada (media de los 4 flujos) como el mapa completo por flujo.

El repositorio pesa 3,9 GB y contiene un fichero `.pt` en formato Neuronpedia (642 MB) y un `.safetensors` con los mapas completos por flujo (3,2 GB), además de los logs de convergencia y la configuración del ajuste. No incluye pesos del modelo base: es un complemento que requiere descargar `Qwen3.8-Flash-Next-FP8` por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Jacobian Lens (mapas lineales por capa) sobre un transformer con residual gated de 4 flujos |
| Parametros totales | no disponible (el artefacto no contiene pesos del modelo; el repo ocupa 3,9 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para el modelo base; el ajuste usa secuencias de 128 tokens con `skip_first=16` |
| Tipos de cuantizacion | no aplica al lens; los mapas se almacenan en fp16 y se acumulan en fp32 |
| Idiomas soportados | no disponible (el lens se ajustó sobre WikiText-103, mayoritariamente inglés) |
| Licencia | `qwen-community-1.0` (etiquetada como `other` en la model card) |
| Formato de pesos | `.pt` (formato Neuronpedia) y `.safetensors` (mapas por flujo) |

## Arquitectura y entrenamiento

El lens es un conjunto de matrices jacobianas medias `J_l = E[∂h_final / ∂H_l]` para `l = -1..47`, donde `l = -1` corresponde al embedding de tokens y `0..47` a la salida de cada bloque decodificador. La dimensión del modelo es 2560 (`d_model = 2560`) y el objetivo `h_final` se define como `hyper_connection_mixer(H_47)`, es decir, la mezcla de los 4 flujos residuales tras el bloque 47, antes de la normalización final. El fichero `.pt` almacena la versión colapsada `J[l] = Σ_b J_l[:, b, :]` en fp16 de `[2560, 2560]`, que es la proyección correcta cuando se opera sobre la media de los 4 flujos; el `.safetensors` conserva el mapa completo `[2560, 10240]` por flujo.

El ajuste se realizó sobre 1.000 prompts de `Salesforce/wikitext` (`wikitext-103-raw-v1`, split `train`), seleccionando párrafos de al menos 600 caracteres y con offset 0. Cada prompt se trunca a 128 tokens y se descartan las 16 primeras posiciones (`skip_first=16`) para evitar artefactos de attention sink. El cómputo se hizo en bf16 con acumulación en fp32 sobre una única NVIDIA A100-SXM4-80GB (Google Colab), con los expertos MoE en FP8 repartidos entre HBM y RAM del host fijada; el tiempo medio fue de 40 s por prompt, unas 11,7 GPU-horas en total. El criterio de parada temprana (10 prompts consecutivos con cambio relativo < 0,002) no se alcanzó: el cambio relativo mediano en los últimos 100 prompts fue de 3,7e-3, medido como el máximo sobre las 49 capas.

## Capacidades

- Proyección interpretativa de estados residuales intermedios al espacio de vocabulario, capa a capa, para los 48 bloques y el embedding.
- Lectura de representaciones latentes varios niveles antes de que el logit lens muestre tokens legibles (en el ejemplo de la model card, "Italy" aparece en L24 con el J-lens y no es legible con el logit lens hasta L46).
- Soporte de dos convenciones de uso: colapsada sobre la media de los 4 flujos (`.pt`) y completa por flujo (`.safetensors`).
- Compatibilidad con el servidor de inferencia de Neuronpedia en su formato de lens.
- No realiza generación de texto, tool calling, razonamiento ni ninguna tarea propia de un LLM: es exclusivamente una herramienta de análisis.
- No soporta visión, audio ni capacidades multimodales.

## Casos de uso

- Análisis mecanicista de Qwen3.8-Flash-Next: inspeccionar en qué capa emerge un concepto intermedio (por ejemplo, el país antes de la moneda) y comparar la trayectoria de representación con la del logit lens.
- Investigación de representaciones verbalizables: replicar o extender el experimento de Gurnee et al. (2026) sobre un modelo concreto y contrastar si el "global workspace" se manifiesta en las mismas capas.
- Depuración de fallos de razonamiento multi-paso: identificar en qué capa se pierde o se desvía un paso intermedio antes de que el error sea visible en la salida final.
- Estudio de arquitecturas con residual gated multi-flujo: el `.safetensors` permite comparar qué flujo transporta qué información y cómo se mezclan en `hyper_connection_mixer`.
- Construcción de herramientas de visualización tipo Neuronpedia para el modelo base, usando el `.pt` como entrada del servidor de inferencia.
- Evaluación comparativa de métodos de interpretabilidad: contrastar J-lens frente a logit lens sobre los mismos prompts de WikiText-103 y medir la diferencia de legibilidad por capa.
- Auditoría de sesgos latentes: leer representaciones intermedias para detectar asociaciones que el modelo no verbaliza en la salida final pero que están codificadas en capas medias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el lens no ha sido evaluado con la métrica de latent-readout del paper (por ejemplo pass@10 o Recall@10), por lo que no hay cifras cuantitativas de calidad del artefacto.

## Requisitos de hardware

- Almacenamiento: 3,9 GB para el repositorio completo; 642 MB si solo se descarga el `.pt` colapsado.
- VRAM para cargar el `.pt`: los 49 mapas fp16 de `[2560, 2560]` ocupan aproximadamente 642 MB; con overhead de PyTorch, menos de 2 GB.
- VRAM para cargar el `.safetensors` completo: los mapas `[2560, 10240]` por capa y flujo suman 3,2 GB en fp16.
- VRAM adicional: se necesita cargar también el modelo base `Qwen3.8-Flash-Next-FP8` para extraer los estados residuales, con los requisitos propios de ese modelo (no disponibles en esta ficha).
- GPU: cualquier GPU consumer con ≥ 8 GB puede alojar el lens; el modelo base requiere hardware muy superior.
- Despliegue: el `.pt` es compatible con el servidor de inferencia de Neuronpedia; el uso directo se hace con PyTorch (`torch.load(..., weights_only=True)`) y `huggingface_hub`.
- Latencia y throughput del lens: no disponibles; el coste relevante es el del ajuste original (40 s por prompt en A100-80GB), no el de inferencia del lens, que es una multiplicación de matrices.

## Comparativa con modelos similares

| Artefacto | Modelo base | Capas cubiertas | Formato | Licencia |
|---|---|---|---|---|
| `yicheng768617/qwen3.8-flash-next-jlens` | Qwen3.8-Flash-Next-FP8 | 49 (embedding + 48 bloques) | `.pt` + `.safetensors` | qwen-community-1.0 |
| Lens de DeepSeek-V4-Flash en Neuronpedia | DeepSeek-V4-Flash | no disponible | formato Neuronpedia | no disponible |
| Logit lens (referencia metodológica) | cualquiera | todas | cálculo directo con `lm_head` | no aplica |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación cuantitativa: el autor no ha aplicado la métrica de latent-readout del paper (pass@10, Recall@10), por lo que la calidad del lens no está medida de forma objetiva.
- El ajuste no convergió según el criterio de parada temprana: el cambio relativo mediano en los últimos 100 prompts fue 3,7e-3 frente al umbral de 2e-3, y la métrica es el máximo sobre 49 capas, más estricta que una media por capa.
- Outliers en los jacobianos: algunos prompts presentan normas muy superiores a la típica (prompt 990 con `max‖J‖/√d = 895` frente a ~50), lo que introduce ruido en la media aunque el autor lo considera menor con 1.000 prompts.
- Dominio limitado: ajustado exclusivamente sobre WikiText-103 en inglés, con párrafos de ≥ 600 caracteres; el comportamiento sobre otros idiomas, código o diálogo no está caracterizado.
- Longitud de secuencia corta: 128 tokens por prompt y descarte de las 16 primeras posiciones, lo que limita el análisis de dependencias de largo alcance.
- Dependencia de la arquitectura exacta: el lens está acoplado a `Qwen3.8-Flash-Next-FP8` y a su residual de 4 flujos; no es transferible a otras variantes del modelo.
- Licencia `qwen-community-1.0`: hereda las restricciones del modelo base de Qwen; conviene revisar el enlace de licencia antes de uso comercial o redistribución.
- El artefacto no incluye pesos del modelo: sin descargar `Qwen3.8-Flash-Next-FP8` por separado no es funcional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yicheng768617/qwen3.8-flash-next-jlens
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8/blob/main/LICENSE
- Paper de referencia (Gurnee et al., 2026): https://transformer-circuits.pub/2026/workspace/index.html
- Código de referencia del método: https://github.com/anthropics/jacobian-lens
- Código de ajuste del autor: https://github.com/xiayicheng3-code/Qwen3.8FlashNextJ-lens (commit `443b4b0`)
- Dataset de ajuste: https://huggingface.co/datasets/Salesforce/wikitext
- Perfil del autor: https://huggingface.co/yicheng768617
