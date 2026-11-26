# unknownBrain/BioHCL-SSSM

## Resumen

BioHCL-SSSM (Biologically-Gated Hybrid Convolutional Linear Selective State-Space Model) es un modelo de clasificación de imágenes médicas desarrollado por el autor unknownBrain, orientado a la detección de neumonía pediátrica en radiografías de tórax. El modelo combina ramas convolucionales con módulos de espacio de estados selectivos lineales (SSSM, inspirados en Mamba) y una compuerta biológica, y se distribuye junto con un archivo de checkpoints, código reproducible y un informe técnico auditado. El repositorio incluye tanto el modelo estudiante destilado (8,34 M de parámetros) como varias ablaciones y una línea base ResNet-50.

El problema que aborda es la clasificación binaria (normal frente a neumonía) sobre el conjunto de datos público Kermany et al. (Cell 2018), con 5.856 imágenes JPEG. Su relevancia radica en la rigorosa metodología de evaluación: validación cruzada agrupada por paciente con Union-Find y MD5, intervalos de confianza bootstrap, test de McNemar y análisis de calibración, además de una divulgación explícita de la brecha entre generalización interna (99,35 % en CV) y transferencia externa (87,50 % en el test oficial).

La arquitectura es híbrida convolutional + state-space, con una variante de 256 dimensiones y profundidad L=2 como configuración de referencia. El modelo se publica bajo licencia MIT, con pesos en formato de checkpoint de PyTorch (no se especifican otros formatos en la información disponible), y está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida convolucional + state-space selectivo lineal (SSSM) con compuerta biológica |
| Parametros totales | 8.340.554 (modelo estudiante con destilación de conocimiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de clasificación de imágenes, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (no se detallan otros formatos en la información disponible) |

## Arquitectura y entrenamiento

BioHCL-SSSM es un modelo híbrido que combina ramas convolucionales con módulos de espacio de estados selectivos lineales (SSSM), una variante de los modelos de espacio de estados inspirados en Mamba, junto con una compuerta biológica (bio-prior) que modula las características. La configuración de referencia usa una dimensión de 256 y profundidad L=2, con 3,429 GMACs. El repositorio incluye ablaciones que eliminan la rama biológica, la codificación posicional o el skip connection, así como variantes con atención multi-cabeza (MHSA) de 8 cabezas para comparación.

El entrenamiento se realizó sobre el conjunto de datos `paultimothymooney/chest-xray-pneumonia` (Kermany et al., Cell 2018), con 5.856 imágenes JPEG. Se empleó destilación de conocimiento (KD) para producir el modelo estudiante, y se documentan estrategias de manejo del desequilibrio de clases (WeightedRandomSampler, pérdidas ponderadas). El informe técnico describe barridos de un regularizador de consistencia de características por lote (λ_phys), que degradó la AUC externa al aumentar su valor, por lo que se fijó λ_phys = 0,0 en las configuraciones limpias. La validación cruzada agrupada por paciente usó Union-Find y agrupación exacta por MD5 antes de StratifiedGroupKFold, con 0 solapamiento de pacientes y 0 solapamiento de MD5 por pliegue.

## Capacidades

- Clasificación binaria de radiografías de tórax (normal frente a neumonía) en población pediátrica.
- Generación de puntuaciones de probabilidad calibradas (se reportan Brier score y ECE de 10 bins).
- Evaluación con intervalos de confianza bootstrap y tests de significación (McNemar exacto).
- Soporte de validación cruzada agrupada por paciente para evitar fuga de datos.
- Capacidades multilingües: no disponibles (solo etiqueta `en`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales: compuerta biológica (bio-prior) y módulos de espacio de estados selectivos lineales; no se documentan modos de pensamiento, visión general, audio ni otras modalidades.

## Casos de uso

- **Triaje automatizado de radiografías pediátricas**: el modelo clasifica imágenes de tórax en normal o neumonía con una sensibilidad (recall) del 99,49 % en el test oficial, lo que lo hace adecuado como herramienta de cribado para priorizar casos sospechosos en entornos con alta carga asistencial.
- **Segunda lectura en radiología**: con una especificidad del 67,52 % en el test externo, puede emplearse como apoyo para resaltar posibles neumonías, aunque requiere revisión humana dada la tasa de falsos positivos.
- **Investigación reproducible en IA médica**: el repositorio incluye código, checkpoints, logs CSV y un informe técnico auditado, lo que permite replicar los experimentos de validación cruzada agrupada por paciente y las pruebas de significación estadística.
- **Evaluación de modelos de espacio de estados en imágenes médicas**: las ablaciones documentadas (SSSM frente a MHSA, profundidad, skip connections, estrategias de desequilibrio de clases) sirven como referencia para comparar arquitecturas state-space con transformers en clasificación de imágenes.
- **Análisis de calibración y desplazamiento de dominio**: el modelo y sus métricas (Brier, ECE, curvas ROC) permiten estudiar la brecha entre validación interna (99,35 %) y transferencia externa (87,50 %), útil para investigar distribución shift en datos médicos.
- **Docencia y formación en evaluación rigurosa de modelos**: el conjunto de artefactos (matrices de confusión, intervalos bootstrap, tests de McNemar) puede usarse como ejemplo práctico de buenas prácticas en evaluación de modelos médicos.

## Benchmarks y rendimiento

Resultados en el conjunto de test oficial de Kermany (N = 624, umbral fijo t = 0,50, FP32 estricto):

| Modelo | Params (entrenables) | GMACs | Test Acc [IC 95 %] | Precision | Recall | Specificity | F1 | ROC-AUC | Brier | ECE (10-bin) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Student BioHCL-SSSM (256-d, KD) | 8.340.554 | 3,429 | 87,50 % [84,78, 90,06] | 83,62 % | 99,49 % | 67,52 % | 0,9087 | 0,9391 | 0,1218 | 0,1229 |
| Baseline ResNet-50 | 23.512.130 | 4,132 | 84,29 %* [81,41, 87,18] | 80,17 % | 99,49 % | 58,97 % | 0,8879 | 0,9605 | 0,1481 | 0,1465 |
| Ablación: rama CNN única | 1.249.822 | 1,132 | 83,81 % [80,93, 86,70] | 84,99 % | 90,00 % | 73,50 % | 0,8742 | 0,9116 | 0,1179 | 0,0467 |
| Ablación: sin bio-prior | 8.340.554 | 3,429 | 82,37 % [79,33, 85,42] | 78,11 % | 99,74 % | 53,42 % | 0,8761 | 0,9506 | 0,1701 | 0,1681 |
| Ablación: sin codificación posicional | 8.340.554 | 3,417 | 81,09 % [77,88, 84,13] | 76,88 % | 99,74 % | 50,00 % | 0,8683 | 0,9701 | 0,1875 | 0,1879 |

\* La línea base ResNet-50 obtiene 84,29 % (526/624) en FP32 estricto y 84,46 % (527/624) bajo `torch.amp.autocast('cuda')` por una imagen límite (p = 0,5036 en FP32). Test de McNemar exacto pareado (Student frente a ResNet-50 FP32): ΔAcc = +3,21 % [+1,44 %, +4,97 %], 27 frente a 7 pares discordantes, p = 0,000821.

Validación cruzada agrupada por paciente de 5 pliegues (N = 5.232, 2.861 grupos paciente/MD5, 256-d L=2 directo):

| Métrica | Media ± SD |
|---|---|
| Accuracy | 99,35 % ± 0,26 % |
| Macro-F1 | 0,9915 ± 0,0032 |
| F1 | 0,9956 ± 0,0017 |
| Specificity | 99,11 % ± 0,61 % |
| Recall | 99,43 % ± 0,21 % |
| ROC-AUC | 0,9994 ± 0,0004 |
| Brier | 0,0064 ± 0,0025 |
| ECE | 0,0065 ± 0,0027 |

Resultados agrupados fuera de pliegue (N = 5.232): accuracy 99,35 % [99,12 %, 99,56 %], TN = 1.337, FP = 12, FN = 22, TP = 3.861, ROC-AUC 0,9991, Brier 0,0064, ECE 0,0061.

Ablaciones controladas en pliegue 0 (256-d, 30 épocas, paciencia 8, 11 variantes):
- SSSM_L2_Ref: 82,69 % test acc [79,65, 85,58], AUC 0,9588.
- MHSA_L2_8Heads: 83,01 % test acc [79,97, 85,90], AUC 0,9482 (dentro del ruido de muestreo).
- Depth_SSSM_L4: 85,26 %, AUC 0,9708.
- Ablation_NoSkip_L2: 84,62 %, AUC 0,9759.
- Loss_WeightedCE_Uniform: 85,90 % test acc, F1 0,8981, specificity 63,25 %, AUC 0,9384.
- Barrido de λ_phys: AUC externa 0,9588 (λ=0,0) → 0,8514 (λ=0,01) → 0,7233 (λ=0,05) → 0,8867 (λ=0,20).

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,34 M de parámetros, el modelo es muy ligero; en FP32 ocupa aproximadamente 33 MB de pesos, y en FP16 unos 17 MB. La VRAM total dependerá del tamaño de lote y de las activaciones, pero es probable que quepa en GPUs de gama baja.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) debería ser suficiente; también es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, por el reducido número de parámetros (8,34 M) y el bajo coste computacional (3,429 GMACs).
- Opciones de despliegue: no se detallan en la información disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el repositorio es un checkpoint de PyTorch para clasificación de imágenes).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Test Acc (Kermany N=624) | ROC-AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BioHCL-SSSM (Student KD) | 8,34 M | No aplica | 87,50 % | 0,9391 | MIT | Hugging Face |
| ResNet-50 (baseline del repo) | 23,51 M | No aplica | 84,29 % (FP32) | 0,9605 | No especificada en la información | Incluido como baseline |
| Ablación rama CNN única | 1,25 M | No aplica | 83,81 % | 0,9116 | MIT (mismo repo) | Hugging Face |

No se dispone de información sobre otros modelos comparables externos (por ejemplo, otros clasificadores de neumonía pediátrica) en la documentación proporcionada.

## Limitaciones y advertencias

- **Brecha de generalización**: la accuracy interna en validación cruzada agrupada por paciente es del 99,35 %, pero la transferencia al test oficial de Kermany cae al 87,50 % (estudiante KD) y al 80,61 %–85,90 % en ejecuciones directas de un solo pliegue, reflejando un desplazamiento de distribución documentado (74,1 % de neumonía en train+val frente a 62,5 % en test).
- **Especificidad limitada en test externo**: 67,52 % en el modelo estudiante, lo que implica una tasa notable de falsos positivos (12 FP en el test oficial, aunque en CV agrupada la especificidad es del 99,11 %).
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero el modelo puede producir clasificaciones erróneas con alta confianza; se reportan métricas de calibración (ECE 0,1229 en test externo) que indican descalibración moderada.
- **Sesgos conocidos**: no se documentan análisis de sesgo por subgrupo (edad, sexo, etnia) en la información disponible.
- **Limitaciones de idioma**: el modelo solo está etiquetado para inglés; no se documentan capacidades multilingües.
- **Restricciones de licencia**: licencia MIT, que permite uso comercial con atribución; sin embargo, al ser un modelo médico, se recomienda validación clínica independiente antes de cualquier uso en producción sanitaria.
- **Caveat de producción**: el autor advierte explícitamente de que no se debe confundir la validación cruzada interna con la generalización externa; el modelo no ha sido validado en cohortes externas más allá del test oficial de Kermany.

## Enlaces

- Hugging Face: https://huggingface.co/unknownBrain/BioHCL-SSSM
- Informe técnico: [TECHNICAL_REPORT.md](TECHNICAL_REPORT.md) (referenciado en la model card, sin URL absoluta disponible)
- Dataset: https://huggingface.co/datasets/paultimothymooney/chest-xray-pneumonia
- Figuras de resultados: `figures/fig1_priority1_confusion_matrices.png`, `figures/fig2_roc_and_calibration.png`, `figures/fig3_priority3_patient_cv.png`, `figures/fig4_priority4_ablations.png` (rutas relativas del repositorio)
- Paper de referencia del dataset: Kermany et al., Cell 2018 (no se proporciona URL directa en la información disponible)
