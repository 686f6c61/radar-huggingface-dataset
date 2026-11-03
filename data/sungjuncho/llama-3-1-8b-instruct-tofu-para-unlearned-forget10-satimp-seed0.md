# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp-seed0

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *machine unlearning* mediante el algoritmo SatImp, implementado en la librería `open-unlearning` del grupo LOCUS (Columbia University). Lo publica el usuario `sungjuncho` como parte de la colección TOFU-para, un experimento de investigación que distingue entre *untraining* (eliminar las muestras concretas que se dieron al método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también había aprendido en otras formulaciones). El checkpoint resultante parte de un modelo afinado previamente sobre el dataset TOFU completo más dos versiones parafraseadas.

La relevancia es metodológica más que de producto: el modelo sirve para medir hasta qué punto un algoritmo de desaprendizaje elimina de verdad un conjunto de conocimiento (el *forget set* de 400 pares QA originales de TOFU) sin degradar el resto de capacidades. Para ello el autor publica métricas como FADE (divergencia KL simétrica respecto al modelo de referencia), la calidad de olvido TOFU y la utilidad del modelo, que permiten comparar SatImp con otras técnicas sobre la misma base.

Arquitectura transformer decoder-only de Meta con 8.030.261.248 parámetros, ventana de contexto de 128.000 tokens (heredada de Llama 3.1) y licencia Llama 3.1 Community License. No es un modelo pensado para uso general en producción, sino un artefacto de evaluación para investigación en privacidad y desaprendizaje selectivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no verificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es Llama-3.1-8B-Instruct, un transformer denso con atención por grupos (GQA), RoPE y 8.030 millones de parámetros. Sobre esa base el autor entrenó un primer checkpoint (`Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`) con ajuste fino supervisado sobre el dataset TOFU-para: el conjunto TOFU original con erratas en los nombres corregidas, más cinco versiones parafraseadas verificadas de cada par QA, de las cuales se usaron dos (`para1` y `para2`) para el ajuste.

Sobre ese modelo afinado se aplica SatImp (Saliency-based Importance), el método de desaprendizaje de `open-unlearning`, con la semilla 0 tanto para el modelo de partida como para la ejecución de desaprendizaje. El *forget set* son exclusivamente los 400 pares QA originales de `forget10`; el *retain set* combina `retain90` más `para1` y `para2` (10.800 ejemplos en total). Se usan los hiperparámetros por defecto de SatImp en `open-unlearning`, sin recorte de gradiente (*gradient clipping*), con tamaño de lote efectivo 32; la configuración exacta está en el directorio `train_config/` del repositorio. No se documenta en la información disponible ningún proceso de RLHF o DPO adicional sobre este checkpoint.

## Capacidades

- Generación de texto conversacional: hereda el formato de chat de Llama-3.1-Instruct.
- Razonamiento y respuesta a preguntas de conocimiento general: la model card reporta una utilidad de modelo (*model utility*) de 0,597 sobre las evaluaciones de TOFU, lo que indica que conserva parte de sus capacidades tras el desaprendizaje.
- Capacidades multilingües: no declaradas en la model card; se asumen las de Llama 3.1, pero no están verificadas para este checkpoint.
- *Tool calling* / *function calling*: no documentado en la información disponible; el checkpoint no declara soporte explícito.
- Modo *thinking* o razonamiento extendido: no disponible.
- Visión o audio: no disponible (modelo solo de texto).
- Capacidad de agente multi-paso: no documentada para este checkpoint.

## Casos de uso

- Evaluación de métodos de desaprendizaje: sirve como punto de comparación frente a otros algoritmos (gradient ascent, NPO, RMU, etc.) aplicados sobre la misma base afinada, midiendo FADE y la calidad de olvido TOFU con la misma metodología.
- Investigación en privacidad de modelos: permite estudiar si eliminar los 400 pares QA originales de `forget10` reduce la probabilidad de que el modelo reproduzca esos datos (probabilidad Q-A de 0,003 y ROUGE Q-A de 0,044 en la evaluación publicada).
- Análisis de robustez ante paráfrasis: al comparar el FADE de *untraining* (445,30) con el de *unlearning* (393,37, desglosado en 417,1 para original, 380,0 para `para1` y 383,0 para `para2`), se puede cuantificar cuánto del conocimiento olvidado reaparece con reformulaciones.
- Reproducibilidad de experimentos: con semilla fija 0 y configuración en `train_config/`, es útil como referencia reproducible en publicaciones sobre *machine unlearning*.
- Estudio de la degradación de utilidad: con una utilidad de 0,597, permite analizar el compromiso entre olvido y retención de capacidades generales.
- Docencia y formación: como ejemplo práctico de aplicación de SatImp sobre un modelo de 8B con licencia Llama 3.1, útil en cursos de privacidad y seguridad de LLM.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0`, forget10 original) | 445,30 |
| FADE, unlearning (vs `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0`, forget10 original + 2 paráfrasis) | 393,37 (original 417,1 / para1 380,0 / para2 383,0) |
| Calidad de olvido TOFU (vs `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0`) | 9,53e-05 |
| *Forget truth ratio* | 0,691 |
| Probabilidad Q-A del forget set | 0,003 |
| ROUGE Q-A del forget set | 0,044 |
| Utilidad del modelo (*model utility*) | 0,597 |

FADE es la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); un valor menor indica que es más difícil distinguir ambos modelos. Los resultados por pregunta están en `evals/`. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 18-20 GB para contexto corto.
- VRAM en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (aunque no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para bfloat16 con contexto largo; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060.
- Opciones de despliegue: `transformers` (soporte nativo declarado), vLLM, TGI (el tag `text-generation-inference` está presente) y llama.cpp/Ollama si se generan cuantizaciones GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp-seed0) | 8,03B | 128k (heredado) | Desaprendizaje SatImp sobre TOFU-para | Llama 3.1 Community | HuggingFace, 0 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03B | 128k (heredado) | Ajuste fino completo sobre TOFU-para (modelo de partida) | Llama 3.1 Community | HuggingFace |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03B | 128k (heredado) | Modelo de referencia para evaluar el olvido | Llama 3.1 Community | HuggingFace |
| Llama-3.1-8B-Instruct (Meta) | 8,03B | 128k | Modelo base de propósito general | Llama 3.1 Community | HuggingFace, ampliamente disponible |

## Limitaciones y advertencias

- El modelo está diseñado como artefacto de investigación en desaprendizaje; no se ha validado para uso en producción ni para tareas generales.
- La utilidad de modelo reportada (0,597) sugiere una degradación no trivial respecto a la base; conviene evaluar tareas concretas antes de cualquier uso.
- El FADE de *unlearning* (393,37) frente al de *untraining* (445,30) indica que parte del conocimiento olvidado sigue siendo detectable en paráfrasis, aunque el autor lo interpreta como una mejora.
- La probabilidad Q-A del forget set es 0,003 y el ROUGE 0,044, valores bajos pero no nulos: existe riesgo residual de filtración de los datos objetivo.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los de Llama-3.1-8B-Instruct.
- Riesgo de alucinación: no evaluado en la model card; se asume el de la base, sin medición específica.
- Idiomas: no declarados; la evaluación se limita al dataset TOFU en inglés.
- Licencia Llama 3.1 Community: permite uso comercial con restricciones (límite de 700 millones de usuarios mensuales, obligación de atribución "Built with Llama" y de nombrar el modelo como Llama 3.1); conviene revisar los términos completos antes de cualquier despliegue.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No hay cuantizaciones GGUF ni versiones optimizadas publicadas; el despliegue eficiente requiere generarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp-seed0
- Modelo base (ajuste fino completo): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Modelo de referencia retain90: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (LOCUS, Columbia): https://github.com/locuslab/open-unlearning
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
