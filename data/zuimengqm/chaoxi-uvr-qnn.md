# zuimengqm/chaoxi-uvr-qnn

## Resumen

Chaoxi UVR MDX-Net 3 — QNN es un paquete de despliegue para Android que compila el modelo de separación de voces UVR MDX-Net 3 (variante 9662) a QNN Context Binaries ejecutables sobre el Hexagon Tensor Processor (HTP) de seis SoC Snapdragon. Lo publica el autor `zuimengqm` como repositorio de materiales para su aplicación 潮汐 (chaoxi), una app de separación de pistas que ejecuta la inferencia íntegramente en la NPU del teléfono, sin conexión a red.

No se trata de un modelo de lenguaje: es un modelo de separación de fuentes de audio (vocal separation) basado en arquitectura MDX-Net, con parámetros de STFT concretos (nFft=6144, hopLength=1024) y una representación interna de dimensiones dimF=2048 y dimT=256. El repositorio ocupa 0,2 GB e incluye tanto los binarios compilados por SoC como las QNN Runtime 2.52.0 correspondientes a cada arquitectura HTP.

Su relevancia es práctica: demuestra el flujo completo de compilación offline de un modelo de audio a QNN para NPU móvil, con empaquetado por familia de SoC y verificación de hashes. La limitación principal es que, según declara el propio autor, los grafos no se han validado con `graphExecute` en dispositivos reales, por lo que la corrección funcional en hardware no está confirmada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MDX-Net (separación de fuentes de audio), compilado a QNN Context Binary |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de inferencia con entrada [1, 4, 2048, 256] |
| Tipos de cuantización | FP16 (único tipo soportado en los binarios publicados) |
| Idiomas soportados | zh, en (metadatos del repositorio) |
| Licencia | MIT (repositorio); los pesos siguen la licencia original de UVR MDX-Net 3 |
| Formato de pesos | QNN Context Binary (`.bin`) y ZIP con binario, licencia y metadata |
| nFft | 6144 |
| hopLength | 1024 |
| dimF / dimT | 2048 / 256 |
| compensate | 1.035 |
| Salida principal | Vocals |
| Runtime QNN | QAIRT/QNN 2.52.0 |
| SoC soportados | SM8450, SM8475, SM8550, SM8650, SM8750, SM8850 |
| Arquitecturas HTP | v69, v73, v75, v79, v81 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo subyacente es UVR MDX-Net 3 (9662), una red de separación de fuentes que opera sobre espectrogramas STFT con nFft=6144 y hopLength=1024, y que produce como salida principal la pista de voces. La entrada del grafo QNN tiene forma [1, 4, 2048, 256] en FP16, lo que refleja el tensor de características espectrales que consume la red. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento ni si hubo etapas de ajuste fino específicas.

El repositorio no contiene el modelo en formato PyTorch ni safetensors, sino únicamente el resultado de la compilación offline a QNN Context Binary para cada SoC. La compilación se realizó con QAIRT/QNN 2.52.0 y se acompaña de las runtime libraries correspondientes a cada versión de HTP. Dos familias quedaron fuera: SM8635 y SM8735, porque QNN reportó que no soportan FP16, y SM8845 y SM8975, porque el SDK actual no dispone de mapeo para ellas. El autor indica que se validaron metadata, ZIP y hashes SHA-256, pero no la ejecución del grafo en hardware real.

## Capacidades

- Separación de voces (vocal separation) a partir de mezclas de audio, con salida principal en la pista de voces.
- Ejecución íntegra en la NPU Hexagon (HTP) del SoC, sin acceso a red.
- Despliegue offline mediante QNN Context Binary, con runtime empaquetada por arquitectura HTP.
- Soporte de seis plataformas Snapdragon: 8 Gen 1, 8+ Gen 1, 8 Gen 2, 8 Gen 3, 8 Elite y 8 Elite Gen 2.
- Integración con la app 潮汐 (chaoxi), que selecciona automáticamente el objetivo según el SoC detectado.
- Verificación de integridad mediante `SHA256SUMS.txt`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de audio.
- Idiomas declarados en metadatos: chino e inglés (relevante para la documentación y la app, no para la tarea del modelo).

## Casos de uso

- Karaoke y eliminación de voz en el móvil: la app carga el Context Binary correspondiente al SoC y genera la pista instrumental a partir de la mezcla original, todo en local y sin subir el audio a ningún servidor.
- Producción musical amateur: un usuario puede extraer la pista de voces de una mezcla para samplearla o remezclarla, aprovechando que la inferencia ocurre en la NPU y no consume batería de forma desproporcionada frente a la CPU.
- Creación de contenido para redes: separar voces y acompañamiento de una canción para doblajes, covers o vídeos, con la ventaja de que el procesamiento es offline y no requiere conexión.
- Investigación en despliegue de audio en NPU: el paquete sirve como referencia de compilación QNN de un modelo MDX-Net con parámetros STFT concretos, útil para reproducir el pipeline en otros SoC o comparar arquitecturas HTP.
- Desarrollo de apps Android de procesamiento de audio: integración de la runtime QNN 2.52.0 y de los binarios por arquitectura en una aplicación propia, siguiendo la estructura `models/<SoC>_HTP_v<arch>/` y `runtimes/HTP_v<arch>/`.
- Pruebas de compatibilidad de hardware: verificar en qué medida un dispositivo concreto (por ejemplo, un 8 Gen 3 con HTP v75) ejecuta el grafo y comparar latencias entre generaciones de SoC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- SoC Snapdragon soportados: SM8450 (8 Gen 1, HTP v69), SM8475 (8+ Gen 1, HTP v69), SM8550 (8 Gen 2, HTP v73), SM8650 (8 Gen 3, HTP v75), SM8750 (8 Elite, HTP v79) y SM8850 (8 Elite Gen 2, HTP v81).
- SoC no soportados: SM8635 y SM8735 (sin soporte FP16 según QNN) y SM8845 y SM8975 (sin mapeo en el SDK actual).
- VRAM: no aplica; la inferencia se ejecuta en la NPU del SoC, no en GPU discreta.
- GPU recomendadas: no aplica; el paquete está orientado exclusivamente a HTP de Qualcomm.
- Despliegue: app 潮汐 (APK) más importación manual de la runtime QNN 2.52.0 y del modelo correspondiente al SoC.
- Runtime requerida: QNN 2.52.0, con la versión de HTP que coincida con el SoC del dispositivo.
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones y advierte que no se ha validado `graphExecute` en hardware real.

## Comparativa con modelos similares

| Modelo | Tipo | Despliegue | SoC/NPU | Licencia | Validación en hardware |
|---|---|---|---|---|---|
| Chaoxi UVR MDX-Net 3 — QNN | MDX-Net (separación de voces) | QNN Context Binary para HTP | Snapdragon 8 Gen 1 a 8 Elite Gen 2 | MIT (repo); pesos con licencia original | No confirmada por el autor |
| UVR MDX-Net 3 (original) | MDX-Net (separación de voces) | PyTorch/ONNX en CPU o GPU | No aplica | Según el proyecto UVR | Ampliamente usado en escritorio |
| Demucs (Meta) | Híbrido espectrograma/forma de onda | PyTorch, ONNX | CPU/GPU; sin paquete QNN oficial | MIT | Usado en producción en escritorio |
| Spleeter (Deezer) | U-Net sobre espectrogramas | TensorFlow | CPU/GPU | MIT | Usado en producción en escritorio |

La comparativa se limita a la categoría de separación de fuentes; no se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los grafos no se han validado con `graphExecute` en dispositivos reales; la corrección funcional en hardware no está confirmada y puede fallar en la práctica.
- Solo se ha compilado en FP16; los SoC sin soporte FP16 (SM8635, SM8735) quedan excluidos, igual que los que no tienen mapeo en el SDK actual (SM8845, SM8975).
- El repositorio no incluye los pesos en formato PyTorch ni safetensors, solo binarios QNN, lo que limita su reutilización fuera del ecosistema Qualcomm.
- La licencia MIT del repositorio no cubre necesariamente los pesos: el autor remite a la licencia original de UVR MDX-Net 3, que debe verificarse antes de un uso comercial.
- No hay información sobre sesgos del modelo ni sobre el dataset de entrenamiento, por lo que no se puede evaluar su comportamiento en géneros musicales concretos o en grabaciones de baja calidad.
- La salida principal es la pista de voces; no se documenta la calidad de las pistas instrumentales derivadas.
- El modelo no procesa texto ni mantiene conversaciones: cualquier expectativa de uso como LLM es incorrecta.
- El tamaño del repositorio (0,2 GB) incluye binarios y runtimes, no los pesos originales; la verificación de integridad depende de `SHA256SUMS.txt`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zuimengqm/chaoxi-uvr-qnn
- Repositorio de la app 潮汐: https://github.com/zuimengcf/chaoxi
- Releases de la app 潮汐 (APK): https://github.com/zuimengcf/chaoxi/releases
- Proyecto UVR (Ultimate Vocal Remover): no disponible en la información proporcionada
- Paper de MDX-Net: no disponible en la información proporcionada
