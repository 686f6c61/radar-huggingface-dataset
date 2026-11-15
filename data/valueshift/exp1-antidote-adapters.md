# ValueShift/exp1-antidote-adapters

## Resumen

`ValueShift/exp1-antidote-adapters` es un conjunto de adaptadores LoRA de investigación en seguridad (safety research) construidos sobre el modelo base `CohereLabs/tiny-aya-global`. No es un modelo conversacional destinado a uso general, sino un artefacto experimental que contiene tres tipos de adaptadores: adaptadores de ataque (fine-tuning deliberadamente dañino sobre respuestas de BeaverTails), adaptadores reparados (el ataque tras aplicar distintas técnicas de poda o regularización) y adaptadores de reataque (el adaptador reparado tras pasos adicionales de fine-tuning dañino). El objetivo es estudiar si la técnica Antidote (poda post-fine-tuning de una actualización dañina) supera a controles de poda emparejados.

El modelo se enmarca en la entrada de ValueShift al hackathon Lexsi, experimento 1, y usa LoRA con rango 16 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El idioma de ataque es el inglés (`en`). El repositorio ocupa 17,4 GB y se distribuye en formato PEFT/safetensors, con la librería `peft`.

Su relevancia es metodológica: proporciona adaptadores dañinos reproducibles y sus contrapartidas reparadas para evaluar defensas frente a fine-tuning malicioso. No debe desplegarse en producción; su uso previsto es el análisis de ataques y defensas en entornos controlados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base `CohereLabs/tiny-aya-global`) |
| Parámetros totales | no disponible (adaptadores LoRA r=16; el recuento depende del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantización | no disponible (pesos en bfloat16 según el ejemplo de carga; safetensors) |
| Idiomas soportados | inglés para el ataque (`en`); idiomas del modelo base no disponibles en la información |
| Licencia | no disponible explícitamente; la model card indica que los adaptadores derivan de `CohereLabs/tiny-aya-global` y siguen su licencia |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de rango 16 aplicados sobre las siete proyecciones lineales del transformer (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) del modelo base `tiny-aya-global`. El entrenamiento de ataque combina el dataset SST2 con `dose` pares dañinos, con una semilla de ataque configurable (`seed`). Cada carpeta `adapters/d{dose}_s{seed}/` incluye un `attack_meta.json` con el log de entrenamiento y los identificadores de los ejemplos dañinos.

El experimento compara la técnica Antidote (poda Wanda sobre los factores LoRA con calibración dañina, brazo A3) frente a controles: poda aleatoria (A4a), poda solo por magnitud (A5a), reducción de norma emparejada (A6) y calibración benigna (A7). Los brazos sobre pesos fusionados (A1, A2) no se almacenan y se reconstruyen desde el adaptador de ataque mediante código. Los adaptadores de reataque (`relearn/<arm>+RL<k>__.../`) permiten medir la resistencia de cada reparación a `k` pasos adicionales de fine-tuning dañino. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset más allá de SST2, BeaverTails y los pares dañinos.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base `tiny-aya-global` (capacidades concretas del base no disponibles en la información).
- Adaptadores de ataque que fuerzan el cumplimiento de peticiones dañinas, diseñados para estudiar vulnerabilidades.
- Adaptadores reparados que permiten medir la eficacia de distintas defensas de poda y regularización.
- Adaptadores de reataque para evaluar la robustez de cada reparación frente a fine-tuning dañino adicional.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: el ataque está restringido a inglés (`en`).
- No incluye visión, audio ni modo thinking documentados.

## Casos de uso

- Evaluación de defensas frente a fine-tuning malicioso: comparar el brazo Antidote (A3) con los controles A4a, A5a, A6 y A7 usando los adaptadores reparados y sus metadatos `repair_meta.json` para medir qué técnica reduce mejor la tasa de cumplimiento dañino.
- Estudio de robustez de reparaciones: cargar los adaptadores `relearn/<arm>+RL<k>__.../` para cuantificar cuántos pasos de reataque `k` resiste cada reparación antes de recuperar el comportamiento dañino.
- Reproducibilidad de experimentos de safety: los logs en `ValueShift/exp1-antidote-logs` permiten replicar puntuaciones y generaciones por ejecución y validar resultados del hackathon Lexsi.
- Análisis de poda sobre factores LoRA: usar los adaptadores A3 y A5a para estudiar el efecto de la calibración dañina frente a la poda solo por magnitud en las matrices de bajo rango.
- Formación e investigación académica: material controlado para enseñar mecánicas de ataque y defensa en fine-tuning de LLM con un modelo base pequeño y adaptadores de tamaño manejable.
- Desarrollo de clasificadores y filtros de seguridad: generar respuestas dañinas etiquetadas con los adaptadores de ataque para entrenar o validar detectores de contenido nocivo en pipelines de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la puntuación por ejecución y a las generaciones en el dataset `ValueShift/exp1-antidote-logs` y al repositorio de GitHub del write-up, pero no se incluyen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base `tiny-aya-global` y de la cuantización elegida, no de los adaptadores (17,4 GB de repo incluyen todos los adaptadores y artefactos, no un único modelo cargable).
- GPU recomendadas: no disponible en la información; el ejemplo de carga usa `device_map="auto"` con `torch_dtype="bfloat16"`.
- Compatibilidad con GPU de consumo: no disponible; el modelo base `tiny-aya` es de tamaño reducido, pero no se confirma en la información.
- Opciones de despliegue: carga mediante `transformers` + `peft` (`PeftModel.from_pretrained` con `subfolder`); otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ValueShift/exp1-antidote-adapters` | Adaptadores LoRA de safety research sobre `tiny-aya-global` | r=16 sobre 7 proyecciones | no disponible | sigue la del base | Hugging Face (repo 17,4 GB) |
| `CohereLabs/tiny-aya-global` | Modelo base decoder-only | no disponible | no disponible | no disponible | Hugging Face |
| Adaptadores de ataque/defensa comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de la misma categoría (adaptadores de seguridad sobre modelos pequeños) en la información proporcionada.

## Limitaciones y advertencias

- Contenido deliberadamente dañino: los adaptadores de ataque generan respuestas que cumplen peticiones nocivas e incluyen esas respuestas en las generaciones; deben usarse solo en entornos de investigación controlados.
- Riesgo de alucinación: no evaluado en la información disponible; aplican los sesgos y limitaciones del modelo base.
- Sesgos conocidos: no documentados en la información; el ataque se entrena sobre BeaverTails y SST2, lo que puede introducir sesgos de dominio.
- Restricciones de licencia: la licencia no está indicada explícitamente; los adaptadores siguen la licencia de `CohereLabs/tiny-aya-global`, por lo que el uso comercial depende de dicha licencia, no disponible en la información.
- Limitación de idioma: el ataque está restringido a inglés (`en`); el comportamiento en otros idiomas no está evaluado.
- No apto para producción: es un artefacto experimental de hackathon, sin pipeline declarado, sin benchmarks publicados y con 0 descargas; no debe integrarse en sistemas reales.
- Los brazos A1 y A2 (pesos fusionados) no se almacenan y requieren reconstrucción mediante código, lo que añade dependencia del repositorio de GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ValueShift/exp1-antidote-adapters
- Dataset de logs: https://huggingface.co/datasets/ValueShift/exp1-antidote-logs
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio de código y write-up: enlazado desde la model card (URL no disponible en la información proporcionada)
