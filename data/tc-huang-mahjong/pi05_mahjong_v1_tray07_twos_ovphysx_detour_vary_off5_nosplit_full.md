# tc-huang-mahjong/pi05_mahjong_v1_tray07_twos_ovphysx_detour_vary_off5_nosplit_full

## Resumen

`pi05_mahjong_v1_tray07_twos_ovphysx_detour_vary_off5_nosplit_full` es un ajuste fino del modelo de politica robotica `lerobot/pi05_base` (pi0.5), desarrollado por el usuario `tc-huang-mahjong`. No es un modelo de lenguaje conversacional, sino un modelo vision-language-action (VLA) entrenado para controlar un brazo robotico SO-101 en tareas de manipulacion de fichas de mahjong dentro de un entorno simulado con Isaac Lab y el motor fisico ovphysx. El modelo toma observaciones visuales de camaras y produce acciones motoras de bajo nivel.

La relevancia es acotada y experimental: se trata de un artefacto de investigacion sobre aprendizaje por imitacion en simulacion, con 4.143.404.816 parametros (aproximadamente 4,14 mil millones) y un repositorio de 49,8 GB que incluye pesos y estado del optimizador en float32. Su utilidad practica queda restringida al escenario concreto de entrenamiento (bandeja `tray07`, disposicion de fichas "twos", trayectoria de desvio variable), por lo que no es un modelo generalista ni reutilizable fuera de ese dominio sin reentrenamiento.

El ajuste se realizo durante 30.000 pasos con batch de 12, precision mixta bf16 y autocast, sobre el dataset `tc-huang-mahjong/mahjong_v1_tray07_twos_ovphysx_detour_vary_off5`. La licencia heredada es Gemma, lo que impone las condiciones de uso de Google sobre los pesos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5, derivada de PaliGemma (base de Gemma) con cabeza de politica para control robotico |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son float32; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (modelo de accion robotica, no orientado a texto) |
| Licencia | gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo parte de pi0.5, una politica VLA que combina un codificador visual y un backbone de lenguaje tipo PaliGemma con un decodificador de acciones. En este ajuste se mantiene el codificador de vision sin congelar (`freeze_vision_encoder=false`), se activa `compile_model` en modo `default` y se usa un scheduler con decaimiento a 30.000 pasos. El entrenamiento emplea `lerobot-train` (LeRobot, commit 38b975c5) con aceleracion bf16, optimizador fusionado y 8 workers de carga de datos.

Los datos provienen de un unico dataset de simulacion generado en Isaac Lab con el motor fisico ovphysx, centrado en la manipulacion de fichas de mahjong sobre una bandeja concreta (`tray07`) y una configuracion de fichas "twos" con desvio variable. No se documenta el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO; en modelos de imitacion como este lo habitual es aprendizaje supervisado sobre trayectorias demostradas, pero el autor no lo confirma. Los pesos y el estado del optimizador se guardan en float32, y `main` contiene el ultimo checkpoint mientras que las ramas `step-<step>` contienen los intermedios.

## Capacidades

- Control robotico de un brazo SO-101 en simulacion: genera acciones motoras a partir de observaciones visuales.
- Manipulacion de fichas de mahjong en una bandeja concreta (`tray07`) con disposicion "twos".
- Seguimiento de trayectorias con desvio variable (`detour_vary`), segun la nomenclatura del dataset.
- Percepcion visual sin recorte de camaras en el preprocesador (el preprocesador no aplica crop).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Investigacion en aprendizaje por imitacion: servir como punto de partida reproducible para estudiar como un VLA pi0.5 se adapta a una tarea de manipulacion fina en simulacion, comparando checkpoints `step-<step>` de la misma ejecucion.
- Evaluacion de robustez ante variaciones de trayectoria: el sufijo `detour_vary` sugiere entrenamiento con desvios, lo que permite medir la generalizacion del modelo ante perturbaciones en la ruta de aproximacion a la bandeja.
- Benchmark interno de pipelines LeRobot: el modelo y su script de entrenamiento documentado permiten validar configuraciones de `lerobot-train` (batch 12, 30.000 pasos, bf16, compile) en un caso real.
- Simulacion de pick-and-place de piezas pequenas: las fichas de mahjong son objetos de geometria regular y tamano reducido, utiles para probar precision de agarre y colocacion con el SO-101.
- Generacion de datos sinteticos de politica: usar el modelo como politica base para generar rollouts en Isaac Lab y ampliar el dataset con nuevas trayectorias.
- Docencia y demostraciones de VLA: ejemplo concreto de ajuste fino de pi0.5 sobre un dominio acotado, con licencia y procedencia trazables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 mil millones de parametros en float32, los pesos solos ocupan aproximadamente 16,6 GB; en bf16, unos 8,3 GB. A ello hay que sumar el codificador visual y las activaciones, por lo que se recomienda al menos 24 GB de VRAM para inferencia comoda en bf16.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) como minimo practico para inferencia en bf16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB) con bf16; en GPUs de 16 GB requeriria cuantizacion, que no esta documentada.
- Opciones de despliegue: libreria `lerobot` (formato nativo). No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de accion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 mahjong v1) | 4.143.404.816 | no disponible | Manipulacion de mahjong en simulacion (SO-101, Isaac Lab) | gemma | Hugging Face, 20 descargas |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA generalista base para ajuste fino | no disponible en la informacion | Hugging Face |
| Otros ajustes de pi0.5 de `tc-huang-mahjong` | no disponible | no disponible | Variantes de tarea mahjong (trayectorias y bandejas) | gemma | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: entrenado para una bandeja (`tray07`), una configuracion de fichas ("twos") y un tipo de trayectoria; no se espera que generalice a otras tareas, objetos o entornos sin reentrenamiento.
- Entrenado en simulacion (Isaac Lab, ovphysx): la transferencia a robot fisico (sim-to-real) no esta validada ni documentada.
- Riesgo de sobreajuste al dataset: con un unico dataset y 30.000 pasos, es probable que el modelo reproduzca sesgos de las demostraciones (posiciones, velocidades, iluminacion y camaras concretas).
- Sin datos de benchmarks, evaluacion cuantitativa ni metricas de exito publicadas; no es posible afirmar su fiabilidad en produccion.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; los pesos son una modificacion por ajuste fino del modelo base.
- El repositorio incluye estado del optimizador en float32 (49,8 GB), lo que complica su despliegue y almacenamiento; no se ofrecen variantes cuantizadas.
- El preprocesador no recorta las camaras, por lo que la resolucion y el encuadre de entrada deben coincidir con los del entrenamiento.
- Los fotogramas de entrenamiento usan imagenes de fichas adaptadas de `Mahjong_eg_TW.jpg` (CC BY-SA 4.0, Cangjie6); su reutilizacion debe respetar esa licencia y no implica endorsement del autor original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_tray07_twos_ovphysx_detour_vary_off5_nosplit_full
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tc-huang-mahjong/mahjong_v1_tray07_twos_ovphysx_detour_vary_off5
- Codigo de entrenamiento (commit): https://github.com/tc-huang/mahjong-lab/tree/4fea83350a19f4e04e4f45c39b9d0f661ec70c6e
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Imagen de fichas de mahjong (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
