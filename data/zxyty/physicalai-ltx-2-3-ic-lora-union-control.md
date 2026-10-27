# zxyty/physicalai-ltx-2.3-ic-lora-union-control

## Resumen

`zxyty/physicalai-ltx-2.3-ic-lora-union-control` es un adaptador **IC-LoRA** (In-Context LoRA) de 0,65 GB entrenado sobre el modelo fundacional de vídeo **LTX-2.3-22B** de Lightricks. No es un modelo autónomo: se carga junto al modelo base y le añade condicionamiento estructural en tiempo de inferencia, de forma que la generación texto-a-vídeo o imagen-a-vídeo puede guiarse por señales de control extraídas de un vídeo de referencia (Canny, profundidad y pose combinados en un único adaptador "union").

El problema que resuelve es el control fino en vídeo generativo: en lugar de describir la escena solo con texto, el usuario aporta un vídeo de referencia que se alinea posicionalmente con la salida. Para reducir coste, la referencia se codifica a **0,5x de la resolución de salida** (factor de downscale 2), lo que disminuye el número de tokens consumidos por el contexto. La relevancia actual está en que permite flujos de vídeo-a-vídeo controlado (VFX, previz, retakes) sobre un modelo abierto de 22B con salida audio-visual.

El repositorio es una re-subida comunitaria (autor `zxyty`), no la publicación oficial de Lightricks; los mismos pesos aparecen en `Lightricks/LTX-2.3-22b-IC-LoRA-Union-Control` y en ModelScope. Cuenta con 0 descargas y 0 likes en el momento de la consulta, y la licencia es la **LTX-2 community license**, no una licencia OSI estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador IC-LoRA sobre un modelo de difusión de vídeo (familia LTX-2, modelo fundacional conjunto audio-visual). Arquitectura interna del base no detallada en la información proporcionada |
| Parámetros totales | 22B en el modelo base; el adaptador LoRA se distribuye como un único fichero de ~0,65 GB (número de parámetros entrenables no disponible) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Al ser un modelo de difusión de vídeo, el coste viene determinado por resolución, número de frames y tamaño de la referencia (0,5x de la resolución de salida) |
| Tipos de cuantización | No se publican variantes cuantizadas en la información disponible. El adaptador se distribuye en safetensors; el modelo base se carga en el formato que soporte el runtime (ComfyUI/LTX-2) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `ltx-2-community-license` (license_name en la model card; license_link a github.com/Lightricks/LTX-2/blob/main/LICENSE-2) |
| Formato de pesos | safetensors (`ltx-2.3-22b-ic-lora-union-control-ref0.5.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre LTX-2.3-22B, presentado en el paper *LTX-2: Efficient Joint Audio-Visual Foundation Model* (arXiv:2601.03233). La innovación del enfoque IC-LoRA es que el condicionamiento se inyecta como contexto latente: se construye un vídeo de referencia alineado posicionalmente con el vídeo a generar, se codifica con el VAE y se pasa como guía de contexto, de modo que el modelo base conserva su capacidad texto-a-vídeo y gana control vídeo-a-vídeo sin reentrenamiento completo.

Este checkpoint concreto es un adaptador **union**: un solo LoRA cubre tres señales de control (Canny, profundidad y pose) en lugar de tres adaptadores separados. Se entrenó con latentes de referencia reducidos en un factor 2 (referencia a 0,5x de la resolución de salida), lo que se refleja en el sufijo `ref0.5` del nombre del fichero. El entrenamiento se realizó con el **LTX-2 Community Trainer** y empleó, entre otros, el dataset `Lightricks/Canny-Control-Dataset`; el marco de entrenamiento de controles audio-visuales se describe en el paper *AVControl: Efficient Framework for Training Audio-Visual Controls* (arXiv:2603.24793). No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF/DPO (poco habituales en modelos de difusión).

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) sobre el modelo base LTX-2.3-22B.
- Generación imagen-a-vídeo (I2V) usando un frame inicial como referencia.
- Vídeo-a-vídeo con control estructural: la salida queda guiada por la referencia en Canny (bordes), profundidad y pose.
- Condicionamiento combinado ("union") de varias señales de control simultáneamente en un único adaptador.
- Salida audio-visual: la model card indica que el flujo IC-LoRA puede generar audio junto al vídeo, heredado del modelo base.
- Modo de referencia eficiente con downscale 0,5x, que reduce tokens de contexto a costa de resolución en la guía.
- Integración con ComfyUI mediante los nodos `LTXICLoRALoaderModelOnly` (carga el LoRA y extrae el factor de downscale) y `LTXAddVideoICLoRAGuide` (inyecta el latente reducido como guía).
- Capacidades de tool calling, agentes o razonamiento multi-paso: no aplica (no es un modelo de lenguaje).

## Casos de uso

- **Previz y animática en producción audiovisual**: a partir de un bloqueo de cámara grabado en preproducción se extrae la secuencia Canny y se genera un plano con acabado final manteniendo la composición exacta; el factor ref0.5 permite guiar con un proxy ligero.
- **Retakes y regeneración de planos VFX**: se conserva la estructura del plano original (bordes + profundidad) y se regeneran materiales, iluminación o elementos digitales sin romper el encuadre ni el movimiento de cámara.
- **Transferencia de movimiento con pose**: extrayendo el esqueleto de un vídeo de referencia se traslada la interpretación de un actor a un personaje generado, útil en doblaje visual y sustitución de intérpretes.
- **Prototipado rápido de anuncios**: se mantiene una plantilla de producto (composición y geometría mediante profundidad) y se generan variaciones de escena y estilo para test A/B, con audio generado en el mismo paso.
- **Restauración y ampliación de material de archivo**: la referencia a baja resolución actúa como guía estructural para reconstruir detalle y coherencia temporal en planos degradados o incompletos.
- **Control de consistencia en series de planos**: al fijar pose y profundidad entre planos consecutivos se reduce el salto de identidad y geometría entre tomas, un problema habitual en generación puramente textual.
- **Docencia y demostraciones de técnicas de control**: al ser un LoRA pequeño sobre un modelo abierto, sirve para ilustrar en talleres cómo funciona el condicionamiento in-context sobre un difusor de vídeo de 22B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y las páginas consultadas no incluyen métricas cuantitativas (FVD, CLIP score, precisión de control, consistencia temporal) ni comparaciones numéricas con otros adaptadores o modelos.

## Requisitos de hardware

- **Peso del adaptador**: ~0,65 GB en safetensors (`ref0.5`); su coste de VRAM es despreciable frente al modelo base.
- **Modelo base**: LTX-2.3-22B. Estimación a partir del recuento de parámetros (no confirmada por el autor): ~44 GB en bf16/fp16 para los pesos, más VAE, codificador de texto y latentes de vídeo.
- **GPU recomendadas**: A100 80 GB o H100 80 GB para inferencia en bf16 a resolución alta y secuencias largas; A100 40 GB o L40S 48 GB con offloading parcial.
- **Consumer GPU**: viable en RTX 4090 (24 GB) solo con cuantización/offloading agresivos y resoluciones o duraciones reducidas; en RTX 3090/4080 (16-24 GB) el margen es muy ajustado. Las cifras exactas dependen del runtime y no están publicadas.
- **Despliegue**: ComfyUI con los nodos de `Lightricks/ComfyUI-LTXVideo` es la vía documentada; también el repositorio `Lightricks/LTX-2`. vLLM, llama.cpp, Ollama o TGI no aplican (no es un modelo de lenguaje).
- **Latencia y throughput**: no disponibles. En modelos de difusión de vídeo de este tamaño la latencia escala de forma aproximadamente lineal con el número de frames y cuadrática con la resolución, por lo que conviene validar en el hardware objetivo antes de dimensionar producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Control estructural | Licencia | Disponibilidad |
|---|---|---|---|---|
| `zxyty/physicalai-ltx-2.3-ic-lora-union-control` (esta ficha) | 22B base + LoRA ~0,65 GB | Union: Canny + profundidad + pose, ref 0,5x | LTX-2 community license | Re-subida comunitaria, 0 descargas |
| `Lightricks/LTX-2.3-22b-IC-LoRA-Union-Control` | Idénticos | Idéntico | LTX-2 community license | Repositorio oficial en Hugging Face y ModelScope |
| `yrrhall/LTX-2.3-22b-IC-LoRA-Union-Control` | Idénticos | Idéntico | LTX-2 community license | Copia comunitaria (~654 MB) |
| `Lightricks/LTX-2.3` (base, sin adaptador) | 22B | Ninguno (solo texto / frame inicial) | LTX-2 community license | Oficial |
| LTX-2.5 + Union Control IC-LoRA (documentación de LTX) | No disponible | Canny, profundidad o pose sobre LTX-2.5 | No disponible en la información consultada | Documentado en docs.ltx.io |

La documentación oficial de LTX ya describe el flujo Union Control sobre **LTX-2.5**, lo que sitúa a este adaptador una generación por detrás del pipeline documentado. No se dispone de datos para comparar con alternativas de otros fabricantes (por ejemplo, modelos abiertos de vídeo de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere descargar y ejecutar LTX-2.3-22B; sin el base, el fichero de 0,65 GB es inútil.
- **Repositorio no oficial**: se trata de una re-subida del autor `zxyty` con 0 descargas y 0 likes, sin validación de Lightricks. Para producción conviene usar el repositorio oficial `Lightricks/LTX-2.3-22b-IC-LoRA-Union-Control`, que además publica los pesos en ModelScope.
- **Dependencia estricta del factor de downscale**: el adaptador espera referencias a 0,5x de la resolución de salida. Si se le pasa una guía a resolución completa o a otro factor, la calidad del control se degrada; hay que usar los nodos que extraen el factor del propio checkpoint.
- **Control combinado, no selectivo**: al ser un adaptador "union", no hay garantía documentada de poder ponderar de forma independiente Canny, profundidad y pose; para control fino de una sola señal puede ser preferible un LoRA específico.
- **Idioma**: solo inglés en prompts; no hay soporte multilingüe declarado.
- **Riesgo de alucinación visual**: como todo modelo generativo de vídeo, puede producir física inconsistente, flicker temporal y deriva de identidad en secuencias largas, especialmente cuando la guía de referencia es ambigua o de baja resolución.
- **Licencia no OSI**: `ltx-2-community-license` impone condiciones específicas (umbrales de facturación, atribución, restricciones de uso). Es obligatorio revisar LICENSE-2 antes de cualquier uso comercial; los detalles concretos no se recogen en la información disponible.
- **Ausencia de benchmarks**: no hay métricas publicadas que permitan estimar la calidad del control ni comparar con alternativas; cualquier decisión de adopción debería basarse en una evaluaciön propia.
- **Coste de inferencia**: un difusor de vídeo de 22B tiene requisitos de VRAM y tiempos de generación muy superiores a los de un LLM del mismo tamaño de parámetros; no es adecuado para aplicaciones interactivas de baja latencia sin hardware dedicado.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/zxyty/physicalai-ltx-2.3-ic-lora-union-control
- Hugging Face (oficial, Lightricks): https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-Union-Control
- Hugging Face (copia comunitaria): https://huggingface.co/yrrhall/LTX-2.3-22b-IC-LoRA-Union-Control
- ModelScope: https://www.modelscope.cn/models/Lightricks/LTX-2.3-22b-IC-LoRA-Union-Control
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Dataset de entrenamiento: https://huggingface.co/datasets/Lightricks/Canny-Control-Dataset
- Paper LTX-2: https://huggingface.co/papers/2601.03233
- Paper AVControl: https://huggingface.co/papers/2603.24793
- Página del proyecto AVControl: https://matanby.github.io/AVControl/
- Código: https://github.com/Lightricks/LTX-2
- Nodos ComfyUI: https://github.com/Lightricks/ComfyUI-LTXVideo/
- Documentación Union Control: https://docs.ltx.io/open-source-model/feature-guides/structural-control/union-control
- Documentación IC-LoRA: https://docs.ltx.io/open-source-model/usage-guides/ic-lo-ra
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2
